document.addEventListener('DOMContentLoaded', async () => {
  // Load face-api.js models
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.ageGenderNet.loadFromUri('/models');
  await faceapi.nets.faceExpressionNet.loadFromUri('/models');

  // Get access to the user's camera
  const video = document.getElementById('video');
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
  video.srcObject = stream;

  // Detect faces and analyze
  video.addEventListener('play', () => {
      const canvas = faceapi.createCanvasFromMedia(video);
      document.getElementById('app').appendChild(canvas);
      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
          const detections = await faceapi.detectAllFaces(video,
              new faceapi.TinyFaceDetectorOptions()).withAgeAndGender().withFaceExpressions();

          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
          resizedDetections.forEach(detection => {
              const { age, gender, expressions } = detection;
              const resultElement = document.getElementById('result');
              resultElement.innerHTML = `
                  Age: ${Math.floor(age)} years<br>
                  Gender: ${gender}<br>
                  Emotions:
                  ${Object.entries(expressions).map(([emotion, score]) =>
                      `<br>${emotion}: ${Math.round(score * 100)}%`).join('')}
              `;
          });
      }, 100);
  });
});
