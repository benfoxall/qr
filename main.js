const buttonScreen = document.querySelector("button#screen");
const buttonCamera = document.querySelector("button#camera");

const link = document.createElement("a");
const video = document.createElement("video");
const error = document.createElement("output");

const mediaConstaints = { audio: false, video: true };

Loop();

async function Run() {
    const screen = on(buttonScreen, "click");
    const camera = on(buttonCamera, "click");

    const pressed = await Promise.race([screen, camera])

    error.remove();

    const stream = await (
        pressed.target.id === 'screen' ?
            navigator.mediaDevices.getDisplayMedia(mediaConstaints) :
            navigator.mediaDevices.getUserMedia(mediaConstaints)
    )

    video.style.opacity = 0.2
    video.autoplay = true;
    video.srcObject = stream;
    document.body.appendChild(video);

    await new Promise((resolve) => {
        video.onplaying = resolve;
    });

    const detector = new BarcodeDetector({
        formats: ["qr_code"],
    });

    while (true) {
        const codes = await detector.detect(video);

        const [first] = codes;
        if (first) {
            console.log(first.rawValue, first);

            document.location = first.rawValue

            break;
        }

        await new Promise(requestAnimationFrame);
    }

    video.pause();
    stream.getTracks().forEach((track) => track.stop());
}

function Loop() {
    Run()
        .catch((e) => {
            video.remove();

            document.body.appendChild(error);

            error.innerText = e;
        })
        .then(Loop);
}

function on(element, event) {
    return new Promise((resolve) =>
        element.addEventListener(event, function handle(e) {
            element.removeEventListener(event, handle);
            resolve(e);
        })
    );
}
