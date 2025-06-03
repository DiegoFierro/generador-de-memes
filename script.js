document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const imageUpload = document.getElementById('imageUpload');
    const topText = document.getElementById('topText');
    const bottomText = document.getElementById('bottomText');
    const downloadMeme = document.getElementById('downloadMeme');
    const memeCanvas = document.getElementById('memeCanvas');
    const noImageMessage = document.getElementById('noImageMessage');
    const memePreview = document.querySelector('.meme-preview');
    const fileNameSpan = document.getElementById('fileName'); // Elemento para mostrar el nombre del archivo
    const ctx = memeCanvas.getContext('2d');

    let currentImage = null;

    /**
     * Dibuja el meme en el canvas, incluyendo la imagen y los textos.
     * También gestiona la visibilidad del canvas y del mensaje "no image".
     */
    const drawMeme = () => {
        console.log('--- drawMeme() called ---');
        console.log('  Current image status:', currentImage);

        if (!currentImage) {
            console.log('  No image loaded. Displaying "no image" message.');
            noImageMessage.style.display = 'flex'; 
            memeCanvas.style.display = 'none'; // Oculta el canvas
            memePreview.classList.remove('has-image');
            ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
            // Aseguramos que el canvas esté en un estado base cuando no hay imagen
            memeCanvas.width = 1; // Para que clearRect funcione con dimensiones mínimas
            memeCanvas.height = 1;
            return;
        }

        console.log('  Image is loaded. Attempting to draw meme.');
        noImageMessage.style.display = 'none'; // Oculta el mensaje
        memeCanvas.style.display = 'block'; // Muestra el canvas
        memePreview.classList.add('has-image'); // Añade clase para estilos CSS condicionales

        // **VERIFICACIÓN CRÍTICA:** Asegura que la imagen tiene dimensiones válidas
        if (currentImage.width === 0 || currentImage.height === 0) {
            console.error('  ERROR: currentImage has zero dimensions! Width:', currentImage.width, 'Height:', currentImage.height);
            alert('La imagen cargada tiene dimensiones inválidas (0). Por favor, intenta con otra imagen. Esto puede pasar con archivos corruptos o tipos no soportados.');
            currentImage = null; // Resetea la imagen para mostrar el mensaje "no image"
            fileNameSpan.textContent = 'Error: Imagen con dimensiones inválidas.';
            drawMeme(); // Vuelve a llamar para actualizar la UI
            return;
        }

        // Establece el tamaño del canvas al tamaño de la imagen cargada
        memeCanvas.width = currentImage.width;
        memeCanvas.height = currentImage.height;
        console.log('  Canvas dimensions set to:', memeCanvas.width, 'x', memeCanvas.height);

        // Dibuja la imagen en el canvas
        ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height); // Limpia el canvas antes de dibujar
        ctx.drawImage(currentImage, 0, 0, memeCanvas.width, memeCanvas.height);
        console.log('  Image drawn onto canvas. (Check for visual output now)');

        // --- Configuración y Estilo del Texto ---
        const baseFontSize = memeCanvas.height * 0.1; 
        const fontFace = 'Arial Black';
        const fontWeight = 'bold';

        ctx.font = `${fontWeight} ${baseFontSize}px ${fontFace}`;
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = memeCanvas.width * 0.006;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic'; 

        const textPadding = memeCanvas.height * 0.04; 
        const maxWidth = memeCanvas.width * 0.9;     
        const lineHeight = baseFontSize * 1.1;       

        const topTextYOffset = baseFontSize * 0.9; 
        const topTextY = textPadding + topTextYOffset;

        const bottomTextYOffset = baseFontSize * 0.3; 
        const bottomTextBaseY = memeCanvas.height - textPadding - bottomTextYOffset;

        // Dibujar el texto superior
        const topTextContent = topText.value.toUpperCase();
        console.log('  Drawing Top Text:', topTextContent, 'at Y:', topTextY);
        drawWrappedText(ctx, topTextContent, memeCanvas.width / 2, topTextY, maxWidth, lineHeight, 'top');

        // Dibujar el texto inferior
        const bottomTextContent = bottomText.value.toUpperCase();
        console.log('  Drawing Bottom Text:', bottomTextContent, 'at Y:', bottomTextBaseY);
        drawWrappedText(ctx, bottomTextContent, memeCanvas.width / 2, bottomTextBaseY, maxWidth, lineHeight, 'bottom');
        console.log('  Text drawn onto canvas.');
    };

    /**
     * Dibuja texto con salto de línea en el canvas, con soporte para alineación vertical.
     */
    function drawWrappedText(context, text, x, y, maxWidth, lineHeight, verticalAlign = 'top') {
        const words = text.split(' ');
        let currentLine = '';
        const lines = [];

        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                lines.push(currentLine.trim());
                currentLine = words[i] + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine.trim());

        let startY = y; 

        if (verticalAlign === 'bottom') {
            startY = y - (lines.length - 1) * lineHeight;
        }

        lines.forEach((line, index) => {
            const lineY = startY + (index * lineHeight);
            context.fillText(line, x, lineY);
            context.strokeText(line, x, lineY);
        });
    }

    // --- Event Listeners ---
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Event: file selected. File name:', file.name, 'File type:', file.type);
            fileNameSpan.textContent = file.name; // Mostrar nombre del archivo
            const reader = new FileReader();
            reader.onload = (event) => {
                console.log('FileReader: onload triggered.');
                const img = new Image();
                img.onload = () => {
                    console.log('Image object: onload triggered. Image dimensions (from img object):', img.width, 'x', img.height);
                    currentImage = img;
                    console.log('Image loaded successfully. Calling drawMeme().');
                    drawMeme(); 
                };
                img.onerror = () => {
                    console.error('Image object: onerror triggered. Error loading image (corrupt or unsupported format).');
                    alert('No se pudo cargar la imagen. Asegúrate de que sea un formato de imagen válido (JPG, PNG, GIF).');
                    currentImage = null;
                    fileNameSpan.textContent = 'Error al cargar imagen.';
                    drawMeme(); 
                };
                img.src = event.target.result; // Establece el source de la imagen
                console.log('Image object: img.src set to data URL.');
            };
            reader.onerror = (error) => {
                console.error('FileReader: onerror triggered. Error reading file:', error);
                alert('Error al leer el archivo. Intenta de nuevo.');
                currentImage = null;
                fileNameSpan.textContent = 'Error de lectura de archivo.';
                drawMeme();
            };
            reader.readAsDataURL(file); // Lee el archivo como URL de datos
        } else {
            console.log('Event: no file selected. Resetting currentImage.');
            currentImage = null;
            fileNameSpan.textContent = 'Ningún archivo seleccionado.';
            drawMeme(); 
        }
    });

    topText.addEventListener('input', drawMeme);
    bottomText.addEventListener('input', drawMeme);

    downloadMeme.addEventListener('click', () => {
        if (currentImage) {
            console.log('Downloading meme...');
            const dataURL = memeCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'mi-meme.png'; 
            link.href = dataURL;
            document.body.appendChild(link);
            link.click(); 
            document.body.removeChild(link);
        } else {
            alert('Por favor, carga una imagen antes de descargar el meme.');
        }
    });

    console.log('DOM Content Loaded. Initializing canvas state on page load.');
    drawMeme(); // Llama a drawMeme al cargar la página para inicializar el estado
});
