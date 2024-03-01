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
                    <canvas id="pong3dCanvas" width="800" height="400" style="background-color: black; margin-bottom: 20px;"></canvas>
                    <div id="lowerCanvases" style="display: flex; justify-content: center; gap: 20px;">
                            <canvas id="pong3dLeft" width="390" height="390" style="background-color: black;"></canvas>
                            <canvas id="pong3dRight" width="390" height="390" style="background-color: black;"></canvas>
                    </div>
                </div>`
                
};
