export const WHATSAPP_SELECTORS = {
    SIDE_PANEL: '#side',
    STATUS_TAB: {
        BUTTONS: [
            'button[aria-label="Actualizaciones en Estados"]',
            'span[data-icon="status-refreshed"]',
            'div[aria-label="Novedades"]',
            'div[aria-label="Updates"]',
            'div[title="Status"]',
            'div[title="Estados"]',
            'span[data-icon="status-outline"]',
            'span[data-icon="status-v3"]',
            'div[aria-label="Status"]',
            'div[aria-label="Estados"]',
            'span[data-icon="newsletter-outline"]'
        ],
        HEADER_BUTTONS: 'header div[role="button"], header button'
    },
    NEW_STATUS_MENU: {
        BUTTONS: [
            'button[aria-haspopup="menu"] span[data-icon="plus"]',
            'span[data-icon="plus"]',
            'div[aria-label="Nuevo estado"]',
            'svg title:contains("ic-add-circle")',
            'div[role="button"] span svg title'
        ],
        ADD_ICON_TITLE: 'ic-add-circle'
    },
    TEXT_STATUS: {
        BUTTONS: [
            'span[data-icon="pencil-refreshed"]',
            'span[data-icon="pencil"]',
            'div[aria-label="Texto"]',
            'li div[aria-label="Texto"]',
            'div[aria-label="Type a status"]',
            'div[aria-label="Escribe un estado"]',
            'span[data-icon="status-v3-pencil"]'
        ],
        EDITOR: 'div[contenteditable="true"]',
        SEND_BUTTONS: [
            'span[data-icon="send"]',
            'div[aria-label="Send"]',
            'div[aria-label="Enviar"]'
        ]
    },
    MEDIA_STATUS: {
        BUTTONS: [
            'span[data-icon="media-refreshed"]',
            'span[data-icon="image"]',
            'div[aria-label="Fotos y videos"]',
            'li div[aria-label="Fotos y videos"]'
        ],
        MY_STATUS: 'div[title="My status"]',
        INPUT_FILE: 'input[type="file"]',
        SEND_BUTTONS: [
            'span[data-icon="send"]',
            'div[aria-label="Send"]',
            'div[aria-label="Enviar"]',
            'span[data-icon="status-v3-send"]'
        ]
    },
    CHATS_TAB: {
        BUTTONS: [
            'button[aria-label="Chats"]',
            'span[data-icon="chat-refreshed"]',
            'div[aria-label="Chats"]',
            'div[title="Chats"]',
            'span[data-icon="chat"]'
        ]
    }
};
