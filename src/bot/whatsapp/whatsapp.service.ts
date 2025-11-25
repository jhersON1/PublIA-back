import { Injectable, Logger } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode = require('qrcode-terminal');
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { WhatsappPuppeteer } from './whatsapp.puppeteer';

@Injectable()
export class WhatsappService {
    private client: Client | null = null;
    private readonly logger = new Logger(WhatsappService.name);
    private readonly puppeteerHelper = new WhatsappPuppeteer();
    private shutdownTimer: NodeJS.Timeout | null = null;
    private readonly SHUTDOWN_DELAY = 30 * 60 * 1000; // 30 minutos

    constructor() { }

    private async ensureClientReady(): Promise<void> {
        if (this.client) {
            this.scheduleShutdown(); // Renovar timer si ya está activo
            return;
        }

        this.logger.log('Inicializando cliente de WhatsApp (Lazy Loading)...');

        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'bot-client',
                dataPath: './.wwebjs_auth',
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        });

        this.setupClientEvents();

        const readyPromise = new Promise<void>((resolve) => {
            this.client!.once('ready', () => {
                this.logger.log('WhatsApp Client is ready!');
                resolve();
            });
        });

        this.client.initialize();
        await readyPromise;
        this.scheduleShutdown();
    }

    private setupClientEvents() {
        if (!this.client) return;

        this.client.on('qr', (qr) => {
            this.logger.log('QR Code received, scan it with your phone:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('authenticated', () => {
            this.logger.log('WhatsApp Client authenticated!');
        });

        this.client.on('auth_failure', (msg) => {
            this.logger.error('WhatsApp Authentication failure:', msg);
        });

        this.client.on('disconnected', (reason) => {
            this.logger.warn('Client was disconnected', reason);
            this.client = null;
        });
    }

    private scheduleShutdown() {
        if (this.shutdownTimer) {
            clearTimeout(this.shutdownTimer);
        }

        this.logger.log(`Programando apagado automático en ${this.SHUTDOWN_DELAY / 60000} minutos.`);

        this.shutdownTimer = setTimeout(async () => {
            await this.destroyClient();
        }, this.SHUTDOWN_DELAY);
    }

    private async destroyClient() {
        if (!this.client) return;

        this.logger.log('Apagando cliente de WhatsApp por inactividad...');
        try {
            await this.client.destroy();
        } catch (e) {
            this.logger.error('Error al destruir cliente', e);
        }
        this.client = null;
        this.shutdownTimer = null;
        this.logger.log('Cliente de WhatsApp apagado.');
    }

    async postStatus(content: string | Express.Multer.File): Promise<void> {
        try {
            await this.ensureClientReady();

            if (!this.client) throw new Error('Client failed to initialize');

            // @ts-ignore
            const page = this.client.pupPage;
            if (!page) {
                throw new Error('No se pudo acceder a la instancia de Puppeteer (pupPage).');
            }

            this.logger.log('Iniciando automatización UI para postear estado...');

            await this.puppeteerHelper.ensureSidePanel(page);
            await new Promise(r => setTimeout(r, 2000));

            await this.puppeteerHelper.navigateToStatusTab(page);

            this.logger.log('En pestaña de estados. Abriendo menú...');
            await new Promise(r => setTimeout(r, 1500));

            await this.puppeteerHelper.openNewStatusMenu(page);
            await new Promise(r => setTimeout(r, 1000));

            if (typeof content === 'string') {
                await this.puppeteerHelper.postTextStatus(page, content);
            } else {
                const tempFilePath = path.join(os.tmpdir(), `status-${Date.now()}.jpg`);
                fs.writeFileSync(tempFilePath, content.buffer);
                try {
                    await this.puppeteerHelper.postImageStatus(page, tempFilePath);
                } finally {
                    try { fs.unlinkSync(tempFilePath); } catch (e) { }
                }
            }

            this.logger.log('Estado publicado. Volviendo a la pestaña de Chats...');
            await new Promise(r => setTimeout(r, 3000));

            await this.puppeteerHelper.returnToChats(page);

            // Renovar el timer después de una operación exitosa
            this.scheduleShutdown();

        } catch (error) {
            this.logger.error('Error posting status via UI:', error);
            throw error;
        }
    }
}
