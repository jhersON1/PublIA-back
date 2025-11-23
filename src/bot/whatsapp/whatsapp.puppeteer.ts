import { Logger } from '@nestjs/common';
import { WHATSAPP_SELECTORS } from './whatsapp.selectors';

export class WhatsappPuppeteer {
    private readonly logger = new Logger(WhatsappPuppeteer.name);

    async ensureSidePanel(page: any): Promise<void> {
        try {
            await page.waitForSelector(WHATSAPP_SELECTORS.SIDE_PANEL, { timeout: 20000 });
        } catch (e) {
            this.logger.warn('Advertencia: El panel lateral #side no apareció a tiempo.');
        }
    }

    async navigateToStatusTab(page: any): Promise<void> {
        await page.evaluate(async (selectors: any) => {
            const startTime = Date.now();
            let statusBtn: HTMLElement | null = null;

            while (Date.now() - startTime < 5000) {
                for (const sel of selectors.BUTTONS) {
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
                const headerBtns = Array.from(document.querySelectorAll(selectors.HEADER_BUTTONS))
                    .map(b => b.getAttribute('aria-label') || b.getAttribute('title') || 'sin-etiqueta');
                throw new Error(`No se encontró el botón de Estados. Botones visibles: ${headerBtns.join(', ')}`);
            }

            statusBtn.click();
        }, WHATSAPP_SELECTORS.STATUS_TAB);
    }

    async openNewStatusMenu(page: any): Promise<void> {
        await page.evaluate(async (selectors: any) => {
            let menuBtn: HTMLElement | null = null;

            // Búsqueda específica del SVG ic-add-circle
            const svgs = Array.from(document.querySelectorAll('svg title'));
            const addIconTitle = svgs.find(el => el.textContent === selectors.ADD_ICON_TITLE);
            if (addIconTitle) {
                menuBtn = addIconTitle.closest('[role="button"]') as HTMLElement ||
                    addIconTitle.closest('button') as HTMLElement;
            }

            if (!menuBtn) {
                for (const sel of selectors.BUTTONS) {
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
        }, WHATSAPP_SELECTORS.NEW_STATUS_MENU);
    }

    async postTextStatus(page: any, text: string): Promise<void> {
        this.logger.log('Seleccionando opción TEXTO...');
        await page.evaluate(async (selectors: any, textContent: string) => {
            let pencilBtn: HTMLElement | null = null;
            for (const sel of selectors.BUTTONS) {
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

            const editor = document.querySelector(selectors.EDITOR);
            if (!editor) throw new Error('No se encontró el editor de texto');

            (editor as HTMLElement).focus();
            document.execCommand('insertText', false, textContent);
            await new Promise(resolve => setTimeout(resolve, 1000));

            let sendBtn: HTMLElement | null = null;
            for (const sel of selectors.SEND_BUTTONS) {
                sendBtn = document.querySelector(sel) as HTMLElement;
                if (sendBtn) break;
            }

            if (!sendBtn) throw new Error('No se encontró el botón Enviar texto');
            sendBtn.click();
        }, WHATSAPP_SELECTORS.TEXT_STATUS, text);
    }

    async postImageStatus(page: any, filePath: string): Promise<void> {
        this.logger.log('Seleccionando opción FOTOS Y VIDEOS...');

        let fileInput = await page.$(WHATSAPP_SELECTORS.MEDIA_STATUS.INPUT_FILE);
        if (!fileInput) {
            await page.evaluate(async (selectors: any) => {
                let mediaBtn: HTMLElement | null = null;
                for (const sel of selectors.BUTTONS) {
                    const el = document.querySelector(sel);
                    if (el) {
                        mediaBtn = el.closest('[role="button"]') as HTMLElement || el.closest('li') as HTMLElement;
                        break;
                    }
                }

                if (mediaBtn) mediaBtn.click();
                else {
                    const myStatus = document.querySelector(selectors.MY_STATUS);
                    if (myStatus) (myStatus as HTMLElement).click();
                }
            }, WHATSAPP_SELECTORS.MEDIA_STATUS);

            await new Promise(r => setTimeout(r, 1000));
            fileInput = await page.$(WHATSAPP_SELECTORS.MEDIA_STATUS.INPUT_FILE);
        }

        if (!fileInput) throw new Error('No se pudo activar el input de archivo.');

        await (fileInput as any).uploadFile(filePath);
        await new Promise(r => setTimeout(r, 2500));

        await page.evaluate(async (selectors: any) => {
            let sendBtn: HTMLElement | null = null;
            for (const sel of selectors.SEND_BUTTONS) {
                sendBtn = document.querySelector(sel) as HTMLElement;
                if (sendBtn) break;
            }
            if (!sendBtn) throw new Error('Botón enviar imagen no encontrado');
            sendBtn.click();
        }, WHATSAPP_SELECTORS.MEDIA_STATUS);
    }

    async returnToChats(page: any): Promise<void> {
        await page.evaluate((selectors: any) => {
            let chatBtn: HTMLElement | null = null;
            for (const sel of selectors.BUTTONS) {
                const element = document.querySelector(sel);
                if (element) {
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
        }, WHATSAPP_SELECTORS.CHATS_TAB);
    }
}
