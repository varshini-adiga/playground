import './iframe';

declare global {
    type WidgetData = {
        [k: string]: unknown;
    };
    let messagePort: MessagePort;
    function decodeHTML(html: string): string;
    let requestCounter: number;
    const widgetDataSubscribers: ((data: WidgetData) => void)[];
    const Adobe: {
        editorType: string;
        showUI(html: string, height?: number): void;
        ui: {
            onmessage: (_event: MessageEvent) => any;
        };
        createText(): void;
        createEllipse(): void;
        createRectangle(): void;
        createLine(): void;
        getUserProfile(): Promise<unknown>;
        getWidgetData(): Promise<unknown>;
        setWidgetData(data: WidgetData): void;
        updateWidgetSize(size: {
            width?: number;
            height?: number;
        }): void;
        setEmbeddedUrl(url: string): void;
        subscribeToWidgetData(handler: (data: WidgetData) => void): void;
        unsubscribeToWidgetData(handler: (data: WidgetData) => void): void;
    };
    function handleHzPortMessage(event: MessageEvent): void;
    function calculatePluginHeight(): number;
    function postMessageAndAwaitResponse(message: {
        [k: string]: unknown;
    }): Promise<unknown>;
    function widgetDataUpdated(event: MessageEvent): void;
}
