import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode = require('qrcode-terminal');
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class WhatsappService implements OnModuleInit {
    private client: Client;
    private readonly logger = new Logger(WhatsappService.name);

    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'bot-client',
                dataPath: './.wwebjs_auth',
            }),
            puppeteer: {
                headless: false, // Visible para debug
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        });
    }

    onModuleInit() {
        this.initializeClient();
    }

    private initializeClient() {
        this.client.on('qr', (qr) => {
            this.logger.log('QR Code received, scan it with your phone:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            this.logger.log('WhatsApp Client is ready!');
        });

        this.client.on('authenticated', () => {
            this.logger.log('WhatsApp Client authenticated!');
        });

        this.client.on('auth_failure', (msg) => {
            this.logger.error('WhatsApp Authentication failure:', msg);
        });

        this.client.initialize();
    }

    async postStatus(content: string | Express.Multer.File): Promise<void> {
        try {
            // @ts-ignore
            const page = this.client.pupPage;
            if (!page) {
                throw new Error('No se pudo acceder a la instancia de Puppeteer (pupPage).');
            }

            this.logger.log('Iniciando automatización UI para postear estado...');

            // 1. Esperar carga del panel lateral (Home)
            try {
                await page.waitForSelector('#side', { timeout: 20000 });
            } catch (e) {
                this.logger.warn('Advertencia: El panel lateral #side no apareció a tiempo.');
            }

            await new Promise(r => setTimeout(r, 2000));

            // 2. NAVEGACIÓN: IR A ESTADOS
            await page.evaluate(async () => {
                const selectors = [
                    'button[aria-label="Actualizaciones en Estados"]', 
                    'span[data-icon="status-refreshed"]',
                    'div[aria-label="Novedades"]',
                    'div[aria-label="Updates"]',
                    'div[title="Status"]'
                ];
                
                const startTime = Date.now();
                let statusBtn: HTMLElement | null = null;

                while (Date.now() - startTime < 5000) {
                    for (const sel of selectors) {
                        const element = document.querySelector(sel);
                        if (element) {
                            statusBtn = (element.tagName === 'SPAN' ? element.closest('[role="button"]') : element) as HTMLElement;
                            if (!statusBtn) statusBtn = (element.tagName === 'SPAN' ? element.closest('button') : element) as HTMLElement;
                            if (!statusBtn) statusBtn = element as HTMLElement;
                            break;
                        }
                    }
                    if (statusBtn) break;
                    await new Promise(r => setTimeout(r, 500));
                }

                if (!statusBtn) {
                    const headerBtns = Array.from(document.querySelectorAll('header div[role="button"], header button'))
                        .map(b => b.getAttribute('aria-label') || b.getAttribute('title') || 'sin-etiqueta');
                    throw new Error(`No se encontró el botón de Estados. Botones visibles: ${headerBtns.join(', ')}`);
                }

                statusBtn.click();
            });

            this.logger.log('En pestaña de estados. Abriendo menú...');
            await new Promise(r => setTimeout(r, 1500));

            // 3. ABRIR EL MENÚ "+"
            await page.evaluate(async () => {
                const menuSelectors = [
                    'button[aria-haspopup="menu"] span[data-icon="plus"]', 
                    'span[data-icon="plus"]', 
                    'div[aria-label="Nuevo estado"]',
                    'svg title:contains("ic-add-circle")', 
                    'div[role="button"] span svg title' 
                ];

                let menuBtn: HTMLElement | null = null;
                
                // Búsqueda específica del SVG ic-add-circle
                const svgs = Array.from(document.querySelectorAll('svg title'));
                const addIconTitle = svgs.find(el => el.textContent === 'ic-add-circle');
                if (addIconTitle) {
                    menuBtn = addIconTitle.closest('[role="button"]') as HTMLElement || 
                              addIconTitle.closest('button') as HTMLElement;
                }

                if (!menuBtn) {
                    for (const sel of menuSelectors) {
                        const el = document.querySelector(sel);
                        if (el) {
                            menuBtn = el.closest('[role="button"]') as HTMLElement || el.closest('button') as HTMLElement;
                            if (menuBtn) break;
                        }
                    }
                }

                if (menuBtn) {
                    menuBtn.click();
                } else {
                    console.log('Advertencia: Botón + no encontrado.');
                }
            });

            await new Promise(r => setTimeout(r, 1000));

            // --- LÓGICA DE CONTENIDO ---

            if (typeof content === 'string') {
                // === MODO TEXTO ===
                this.logger.log('Seleccionando opción TEXTO...');
                await page.evaluate(async (text) => {
                    const pencilSelectors = [
                        'span[data-icon="pencil-refreshed"]', 
                        'span[data-icon="pencil"]',
                        'div[aria-label="Texto"]',
                        'li div[aria-label="Texto"]'
                    ];

                    let pencilBtn: HTMLElement | null = null;
                    for (const sel of pencilSelectors) {
                        const el = document.querySelector(sel);
                        if (el) {
                            pencilBtn = el.closest('[role="button"]') as HTMLElement || el.closest('li') as HTMLElement;
                            break;
                        }
                    }

                    if (!pencilBtn) pencilBtn = document.querySelector('div[aria-label="Type a status"]') as HTMLElement;
                    if (!pencilBtn) throw new Error('No se encontró la opción de Texto (Lápiz)');
                    
                    pencilBtn.click();
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    const editor = document.querySelector('div[contenteditable="true"]');
                    if (!editor) throw new Error('No se encontró el editor de texto');

                    (editor as HTMLElement).focus();
                    document.execCommand('insertText', false, text);
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const sendBtn = document.querySelector('span[data-icon="send"]') || 
                                    document.querySelector('div[aria-label="Send"]') || 
                                    document.querySelector('div[aria-label="Enviar"]');
                    
                    if (!sendBtn) throw new Error('No se encontró el botón Enviar texto');
                    (sendBtn as HTMLElement).click();
                }, content);

            } else {
                // === MODO IMAGEN ===
                this.logger.log('Seleccionando opción FOTOS Y VIDEOS...');
                const tempFilePath = path.join(os.tmpdir(), `status-${Date.now()}.jpg`);
                fs.writeFileSync(tempFilePath, content.buffer);

                try {
                    let fileInput = await page.$('input[type="file"]');
                    if (!fileInput) {
                        await page.evaluate(async () => {
                            const mediaSelectors = [
                                'span[data-icon="media-refreshed"]', 
                                'span[data-icon="image"]',
                                'div[aria-label="Fotos y videos"]',
                                'li div[aria-label="Fotos y videos"]'
                            ];
                            
                            let mediaBtn: HTMLElement | null = null;
                            for (const sel of mediaSelectors) {
                                const el = document.querySelector(sel);
                                if (el) {
                                    mediaBtn = el.closest('[role="button"]') as HTMLElement || el.closest('li') as HTMLElement;
                                    break;
                                }
                            }

                            if (mediaBtn) mediaBtn.click();
                            else {
                                const myStatus = document.querySelector('div[title="My status"]');
                                if (myStatus) (myStatus as HTMLElement).click();
                            }
                        });
                        await new Promise(r => setTimeout(r, 1000));
                        fileInput = await page.$('input[type="file"]');
                    }

                    if (!fileInput) throw new Error('No se pudo activar el input de archivo.');

                    await (fileInput as any).uploadFile(tempFilePath);
                    await new Promise(r => setTimeout(r, 2500)); 

                    await page.evaluate(async () => {
                        const sendSelectors = [
                            'span[data-icon="send"]', 
                            'div[aria-label="Send"]', 
                            'div[aria-label="Enviar"]',
                            'span[data-icon="status-v3-send"]'
                        ];
                        let sendBtn: HTMLElement | null = null;
                        for (const sel of sendSelectors) {
                            sendBtn = document.querySelector(sel) as HTMLElement;
                            if (sendBtn) break;
                        }
                        if (!sendBtn) throw new Error('Botón enviar imagen no encontrado');
                        sendBtn.click();
                    });
                } finally {
                    try { fs.unlinkSync(tempFilePath); } catch (e) {}
                }
            }

            this.logger.log('Estado publicado. Volviendo a la pestaña de Chats...');
            
            // --- CORRECCIÓN FINAL: VOLVER A CHATS ---
            // Esperamos a que termine la animación de envío
            await new Promise(r => setTimeout(r, 2000));

            await page.evaluate(() => {
                // Usamos los selectores EXACTOS de tu HTML (chat-refreshed y button label="Chats")
                const chatSelectors = [
                    'button[aria-label="Chats"]', 
                    'span[data-icon="chat-refreshed"]',
                    'div[aria-label="Chats"]',
                    'div[title="Chats"]',
                    'span[data-icon="chat"]'
                ];
                
                let chatBtn: HTMLElement | null = null;
                for (const sel of chatSelectors) {
                    const element = document.querySelector(sel);
                    if (element) {
                        // Si seleccionamos el icono, subimos al botón padre
                        chatBtn = (element.tagName === 'SPAN' ? element.closest('[role="button"]') : element) as HTMLElement;
                        if (!chatBtn) chatBtn = (element.tagName === 'SPAN' ? element.closest('button') : element) as HTMLElement;
                        if (!chatBtn) chatBtn = element as HTMLElement;
                        break;
                    }
                }

                if (chatBtn) {
                    chatBtn.click();
                    console.log('Regresando a pestaña Chats...');
                } else {
                    console.error('No se encontró el botón de Chats para volver.');
                }
            });

        } catch (error) {
            this.logger.error('Error posting status via UI:', error);
            throw error;
        }
    }
}
