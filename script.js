const video = document.getElementById('video')


Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo(){
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}



video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = {width: video.width, height: video.height}
    faceapi.matchDimensions(canvas, displaySize)
    
    

    let expressionTally = {
        happy: 0,
        sad: 0,
        angry: 0,
        neutral: 0,
        fearful: 0,
        surprised: 0,
        disgusted:0 
    }
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        console.log(detections)
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        if (detections.length > 0) {
            // const mostConfidentExpression = Object.keys(detections[0].expressions).reduce((a, b) => detections[0].expressions[a] > detections[0].expressions[b] ? a : b);
            expressionTally.happy += detections[0].expressions.happy
            expressionTally.sad += detections[0].expressions.sad
            expressionTally.angry += detections[0].expressions.angry
            expressionTally.neutral += detections[0].expressions.neutral/5
            expressionTally.fearful += detections[0].expressions.fearful
            expressionTally.surprised += detections[0].expressions.surprised
            expressionTally.disgusted += detections[0].expressions.disgusted

            // expressionTally[mostConfidentExpression]++;
            console.log(expressionTally)

        }
        let expressionTable = `<table>
                        <tr>
                            <th>Expression</th>
                            <th>Count</th>
                        </tr>`;
for (let expression in expressionTally) {
    expressionTable += `<tr>
                            <td>${expression}</td>
                            <td>${Math.round(expressionTally[expression]) * 10 / 10}</td>
                        </tr>`;
}
expressionTable += `</table>`;
document.getElementById("expression-tally").innerHTML = expressionTable;

    }, 100)

    
    })


