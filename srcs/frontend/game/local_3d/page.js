const translations = {
        en: {
            vs: "1 vs 1",
            start: "Start",
        },
        fr: {
            vs: "1 contre 1",
            start: "Commencer",
        },
        ko: {
            vs: "1 대 1",
            start: "시작",
        },
    };

export function local3dPage() {
        const t = translations[currentLanguage];
        return `<div class="d-flex flex-column justify-content-center">
                    <div class="d-flex flex-column justify-content-center" id="startButton">
                            <button class="d-flex justify-content-center btn btn-sm btn-outline-success mt-2 p-2 px-3 m-auto" id="3dMode">${t.start}</button>
                    </div>
                    <canvas class="d-none" id="pong3dCanvas""></canvas>
                    <div id="lowerCanvases" style="display: flex; justify-content: center;">
                            <canvas class="d-none" id="pong3dLeft"></canvas>
                            <canvas class="d-none" id="pong3dRight"></canvas>
                    </div>
                </div>`
                
};
