document.body.addEventListener('click', async () => {
    await countDown();
    document.body.classList.remove('loading');
    startRec(true);
})

function updateLights(bri, xy, xy2) {
    const conf = {
        method: 'PUT',
        body: JSON.stringify({ bri, /* xy */ })
    };
    const ip = '192.168.1.2';
    const user = 'Z06CI4V3LOCY02dQHQxAfQJcEU8jlEyE825u1q2l';

    fetch(`http://${ip}/api/${user}/lights/2/state`, conf);
    fetch(`http://${ip}/api/${user}/lights/3/state`, conf);
}

function getColor(iterations, iteration) {
    const h = iteration / iterations;
    const rgb = hslToRgb(h, 1, .5);
    const xy = getXY(...rgb);

    return {
        xy,
        rgb
    };
}

function createDiv(rgb) {
    const div = document.createElement('div');
    div.classList.add('color');
    div.style.background = `rgb(${rgb.join()})`
    document.body.appendChild(div);
}

function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

async function countDown() {
    const create = async (text = '') => {
        const div = document.createElement('div');
        div.innerHTML = text;
        div.classList.add('countdown');
        document.querySelector('.countdown-container').appendChild(div);
        await wait(950);
        div.remove();
    }

    await create();
    await create(3);
    await create(2);
    await create(1);
}

function VolumeMeter(context) {
    this.context = context;
    this.volume = 0.0;
    this.prevVolume = 0.0;
    this.script = context.createScriptProcessor(2048, 1, 1);
    this.script.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        let sum = 0.0;
        for (let i = 0; i < input.length; ++i) {
            if (!isNaN(sum) && isNaN(sum + input[i])) {
                console.log({ sum, input: input[i], input, i })
            }
            sum += Math.max(input[i], 0);
        }
        this.volume = (this.prevVolume + Math.sqrt(sum / input.length)) / 2;
        this.prevVolume = this.volume;
    };
}
VolumeMeter.prototype.connectToSource = function (stream, callback) {
    try {
        this.mic = this.context.createMediaStreamSource(stream);
        this.mic.connect(this.script);
        this.script.connect(this.context.destination);
        if (typeof callback !== 'undefined') {
            callback(null);
        }
    } catch (e) {
        // what to do on error?
    }
};
VolumeMeter.prototype.stop = function () {
    this.script.onaudioprocess = () => { }
    this.mic.disconnect();
    this.script.disconnect();
};

let i;
const startRec = function (lights) {
    try {
        window.audioContext = new AudioContext();
    } catch (e) {
        alert('Web Audio API not supported.');
    }
    const constraints = {
        audio: true,
        video: false
    };
    function handleSuccess(stream) {
        window.stopRec = function () {
            clearInterval(i);
            volumeMeter.stop();
        }
        const volumeMeter = new VolumeMeter(window.audioContext);
        window.volumeMeter = volumeMeter;

        volumeMeter.connectToSource(stream, function () {
            let count = [];
            let average;
            let iteration = 0;
            const ms = 150;
            let iterations = (1000 / ms) * 60;

            i = setInterval(() => {
                const bri = Math.min(254, Math.round(Math.pow(volumeMeter.volume * 40, 2.5)));
                const { xy, rgb } = getColor(iterations, iteration++);
                const { xy: xy2 } = getColor(iterations, iterations - iteration);

                lights && updateLights(bri, xy, xy2);

                // createDiv(rgb);
                document.body.style.background = `rgb(${rgb.join()})`;
                console.log({ bri, volume: volumeMeter.volume, xy, rgb });
            }, ms);

            let intv = setInterval(() => {
                count.push(volumeMeter.volume);

                if (count.length === 50) {
                    clearInterval(intv);
                    average = count.reduce((sum, val) => val + sum, 0);
                    console.log({ average });

                }
            }, 100);
        });
    }
    function handleError(error) {
        // what to do on error?
    }
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError);
};

function create(iterations, iteration = 1) {
    setTimeout(() => {
        // Get color
        const h = iteration / iterations;
        const [r, g, b] = hslToRgb(h, 1, .5);

        // Create div
        const div = document.createElement('div');
        div.style.background = `rgb(${r}, ${g}, ${b})`
        document.body.appendChild(div);

        // Recall
        if (iteration < iterations) {
            create(iterations, iteration + 1);
        }

        // Log
        console.log([r, g, b], getXY(...[r, g, b]))
    }, 1000 / iterations);
}
// create(50);

let iterations = 5 * 60;
let iteration = 0;
while (++iteration < iterations) {
    // createDiv(getColor(iterations, iteration).rgb);
}