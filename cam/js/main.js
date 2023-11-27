document.addEventListener('DOMContentLoaded', function() {
    let streaming = false;
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureButton = document.getElementById('captureButton');
    
    const startCamera = () => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
          video.srcObject = stream;
          video.play();
          streaming = true;
        })
        .catch(function(err) {
          console.log('Erro ao acessar a câmera:', err);
        });
    };
  
    const stopCamera = () => {
      if (streaming) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
  
        tracks.forEach(track => {
          track.stop();
        });
  
        video.srcObject = null;
        streaming = false;
      }
    };
  
    const takePicture = () => {
      if (!streaming) return;
  
      const context = canvas.getContext('2d');
      if (video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
        const imageData = canvas.toDataURL('image/jpeg');
        savePhoto(imageData);
      }
    };
  
    const savePhoto = (imageData) => {
      const request = window.indexedDB.open('FotosDB', 1);
      let db;
  
      request.onerror = function(event) {
        console.log('Erro ao abrir o banco de dados:', event.target.errorCode);
      };
  
      request.onsuccess = function(event) {
        db = event.target.result;
        const transaction = db.transaction(['fotos'], 'readwrite');
        const objectStore = transaction.objectStore('fotos');
  
        const foto = {
          imageData: imageData,
          timestamp: new Date().getTime()
        };
  
        const addRequest = objectStore.add(foto);
  
        addRequest.onsuccess = function(event) {
          console.log('Foto salva com sucesso no IndexedDB');
        };
  
        addRequest.onerror = function(event) {
          console.log('Erro ao salvar a foto:', event.target.errorCode);
        };
      };
  
      request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('fotos', { keyPath: 'id', autoIncrement: true });
        console.log('Banco de dados atualizado');
      };
    };
  
    captureButton.addEventListener('click', takePicture);
  
    startCamera();
  });
  