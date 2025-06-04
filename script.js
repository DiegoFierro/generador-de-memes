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
    const loadingIndicator = document.getElementById('loadingIndicator'); // Referencia al nuevo elemento

    // Nuevos elementos para tamaño de fuente
    const topTextSizeInput = document.getElementById('topTextSize');
    const topTextSizeValue = document.getElementById('topTextSizeValue');
    const bottomTextSizeInput = document.getElementById('bottomTextSize');
    const bottomTextSizeValue = document.getElementById('bottomTextSizeValue');

    const darkModeToggle = document.getElementById('darkModeToggle'); // Botón para Dark Mode

    const ctx = memeCanvas.getContext('2d');

    let currentImage = null; // Variable para almacenar la imagen cargada actualmente.

    /**
     * Gestiona la interfaz de usuario cuando no hay imagen cargada.
     * Muestra el mensaje 'noImageMessage', oculta el canvas y ajusta clases CSS.
     * @param {CanvasRenderingContext2D} ctx - El contexto 2D del canvas.
     * @param {HTMLCanvasElement} canvasEl - El elemento HTML canvas.
     * @param {HTMLElement} noImageMsgEl - El elemento HTML para mostrar el mensaje de "no imagen".
     * @param {HTMLElement} memePreviewEl - El elemento HTML contenedor de la previsualización del meme.
     */
    const handleNoImageState = (ctx, canvasEl, noImageMsgEl, memePreviewEl) => {
        console.log('  No image loaded. Displaying "no image" message.');
        noImageMsgEl.style.display = 'flex';
        canvasEl.style.display = 'none'; // Oculta el canvas
        memePreviewEl.classList.remove('has-image');
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        // Aseguramos que el canvas esté en un estado base cuando no hay imagen
        canvasEl.width = 1; // Para que clearRect funcione con dimensiones mínimas
        canvasEl.height = 1;
    };

    /**
     * Configura las dimensiones del canvas para que coincidan con las de la imagen cargada.
     * @param {HTMLCanvasElement} canvasEl - El elemento HTML canvas.
     * @param {HTMLImageElement} image - La imagen cargada.
     */
    const setupCanvasDimensions = (canvasEl, image) => {
        canvasEl.width = image.width;
        canvasEl.height = image.height;
        console.log('  Canvas dimensions set to:', canvasEl.width, 'x', canvasEl.height);
    };

    /**
     * Limpia el canvas y dibuja la imagen proporcionada en él.
     * @param {CanvasRenderingContext2D} ctx - El contexto 2D del canvas.
     * @param {HTMLImageElement} image - La imagen a dibujar.
     * @param {HTMLCanvasElement} canvasEl - El elemento HTML canvas.
     */
    const drawImageOnCanvas = (ctx, image, canvasEl) => {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height); // Limpia el canvas antes de dibujar
        ctx.drawImage(image, 0, 0, canvasEl.width, canvasEl.height);
        console.log('  Image drawn onto canvas. (Check for visual output now)');
    };

    /**
     * Configura y devuelve las propiedades generales del texto para el meme.
     * Estas propiedades incluyen color, estilo de trazo, alineación y cálculos
     * para el ancho máximo del texto y el padding.
     * La fuente específica (tamaño, familia) se establece justo antes de dibujar cada texto.
     * @param {CanvasRenderingContext2D} ctx - El contexto 2D del canvas.
     * @param {HTMLCanvasElement} canvasEl - El elemento HTML canvas.
     * @returns {Object} Un objeto con propiedades de texto: fontFace, fontWeight, maxWidth, textPadding, referenceFontSize.
     */
    const configureTextProperties = (ctx, canvasEl) => {
        const fontFace = 'Arial'; // Familia de fuente base para el texto del meme.
        const fontWeight = 'bold';   // Peso de la fuente base.

        ctx.fillStyle = 'white'; // Color de relleno del texto.
        ctx.strokeStyle = 'black'; // Color del trazo (borde) del texto.

        // Calcula un tamaño de fuente de referencia basado en la altura del canvas.
        // Este se usa para cálculos proporcionales como el grosor del trazo y el padding.
        const referenceFontSizeForCalcs = canvasEl.height * 0.1;
        // El grosor del trazo es proporcional al tamaño de fuente de referencia, con un mínimo de 1px.
        ctx.lineWidth = Math.max(1, referenceFontSizeForCalcs * 0.06);
        ctx.textAlign = 'center'; // Alineación horizontal del texto.
        ctx.textBaseline = 'alphabetic'; // Línea base vertical del texto.

        return {
            fontFace,
            fontWeight,
            maxWidth: canvasEl.width * 0.9, // Ancho máximo para el texto, 90% del ancho del canvas.
            textPadding: canvasEl.height * 0.04, // Padding general relativo a la altura de la imagen.
            referenceFontSize: referenceFontSizeForCalcs // Devuelve el tamaño de fuente de referencia para otros cálculos.
        };
    };

    /**
     * Función principal para dibujar el meme.
     * Orquesta el manejo del estado sin imagen, la configuración del canvas,
     * el dibujado de la imagen y la representación de los textos superior e inferior.
     */
    const drawMeme = () => {
        console.log('--- drawMeme() called ---');
        console.log('  Current image status:', currentImage);

        if (!currentImage) {
            handleNoImageState(ctx, memeCanvas, noImageMessage, memePreview);
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

        setupCanvasDimensions(memeCanvas, currentImage);
        drawImageOnCanvas(ctx, currentImage, memeCanvas);

        const { fontFace, fontWeight, maxWidth, textPadding, referenceFontSize } = configureTextProperties(ctx, memeCanvas);

        // Obtener valores de los sliders
        const currentTopTextSize = topTextSizeInput.value;
        const currentBottomTextSize = bottomTextSizeInput.value;

        // Posicionamiento del texto (puede seguir usando referenceFontSize o adaptarse a los nuevos tamaños)
        // Usaremos referenceFontSize para el padding y el offset inicial para mantener consistencia relativa a la imagen
        const topTextYOffset = referenceFontSize * 0.9; // Offset desde el padding
        const topTextY = textPadding + topTextYOffset;

        const bottomTextYOffset = referenceFontSize * 0.3; // Offset desde el borde inferior antes del padding
        const bottomTextBaseY = memeCanvas.height - textPadding - bottomTextYOffset;

        // Dibujar el texto superior
        ctx.font = `${fontWeight} ${currentTopTextSize}px ${fontFace}`;
        const topTextContent = topText.value.toUpperCase();
        console.log('  Drawing Top Text:', topTextContent, 'at Y:', topTextY, 'Size:', currentTopTextSize);
        drawWrappedText(ctx, topTextContent, memeCanvas.width / 2, topTextY, maxWidth, parseFloat(currentTopTextSize), 'top');

        // Dibujar el texto inferior
        ctx.font = `${fontWeight} ${currentBottomTextSize}px ${fontFace}`;
        const bottomTextContent = bottomText.value.toUpperCase();
        console.log('  Drawing Bottom Text:', bottomTextContent, 'at Y:', bottomTextBaseY, 'Size:', currentBottomTextSize);
        drawWrappedText(ctx, bottomTextContent, memeCanvas.width / 2, bottomTextBaseY, maxWidth, parseFloat(currentBottomTextSize), 'bottom');

        console.log('  Text drawn onto canvas.');
    };

    /**
     * Dibuja texto con salto de línea en el canvas, con soporte para alineación vertical.
     * @param {CanvasRenderingContext2D} context - El contexto del canvas.
     * @param {string} text - El texto a dibujar.
     * @param {number} x - La coordenada X del centro del texto.
     * @param {number} y - La coordenada Y para la primera línea (o base para la última si es 'bottom').
     * @param {number} maxWidth - El ancho máximo permitido para el texto.
     * @param {number} fontSize - El tamaño de la fuente en píxeles.
     * @param {string} text - El texto a dibujar.
     * @param {number} x - La coordenada X del centro del texto.
     * @param {number} y - La coordenada Y para la primera línea (si verticalAlign es 'top') o la base para la última línea (si verticalAlign es 'bottom').
     * @param {number} maxWidth - El ancho máximo permitido para el texto antes de que se divida en múltiples líneas.
     * @param {number} fontSize - El tamaño de la fuente en píxeles.
     * @param {'top' | 'bottom'} verticalAlign - Especifica si el texto se alinea desde la parte superior o inferior de su cuadro delimitador.
     */
    function drawWrappedText(context, text, x, y, maxWidth, fontSize, verticalAlign = 'top') {
        // Calcula la altura de línea basada en el tamaño de la fuente.
        // Un multiplicador de 1.1 proporciona un espaciado estándar.
        const lineHeight = fontSize * 1.1;
        const words = text.split(' ');
        let currentLine = '';
        const lines = [];

        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i] + ' ';
            const metrics = context.measureText(testLine); // measureText usa el ctx.font actual
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
            // Si la alineación es inferior, ajusta startY para que la última línea de texto
            // se dibuje en la coordenada 'y' especificada. Esto significa que 'y'
            // actúa como la línea base de la última línea de texto.
            startY = y - ((lines.length - 1) * lineHeight);
        }

        // Dibuja cada línea de texto en el canvas.
        lines.forEach((line, index) => {
            const lineY = startY + (index * lineHeight);
            context.fillText(line, x, lineY);
            context.strokeText(line, x, lineY);
        });
    }

    // --- Manejadores de Eventos ---

    /**
     * Maneja el evento de cambio del input de carga de imagen.
     * Lee el archivo seleccionado, lo carga como una imagen y luego llama a drawMeme.
     * Gestiona la visibilidad del indicador de carga y los mensajes de error.
     * @param {Event} e - El objeto evento del input.
     */
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameSpan.textContent = file.name; // Muestra el nombre del archivo seleccionado.
            loadingIndicator.style.display = 'block'; // Muestra el indicador de carga.
            noImageMessage.style.display = 'none'; // Oculta el mensaje de "no imagen".

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    currentImage = img; // Almacena la imagen cargada.
                    loadingIndicator.style.display = 'none'; // Oculta el indicador de carga.
                    drawMeme(); // Dibuja el meme con la nueva imagen.
                };
                img.onerror = () => {
                    // Manejo de error si la imagen no se puede cargar (ej. formato corrupto).
                    alert('No se pudo cargar la imagen. Asegúrate de que sea un formato de imagen válido (JPG, PNG, GIF).');
                    currentImage = null;
                    loadingIndicator.style.display = 'none';
                    fileNameSpan.textContent = 'Error al cargar imagen.';
                    drawMeme(); // Actualiza la UI para mostrar el estado "sin imagen".
                };
                img.src = event.target.result; // Establece el source de la imagen para iniciar la carga.
            };
            reader.onerror = (error) => {
                // Manejo de error si FileReader no puede leer el archivo.
                console.error('FileReader error:', error);
                alert('Error al leer el archivo. Intenta de nuevo.');
                currentImage = null;
                loadingIndicator.style.display = 'none';
                fileNameSpan.textContent = 'Error de lectura de archivo.';
                drawMeme();
            };
            reader.readAsDataURL(file); // Inicia la lectura del archivo como Data URL.
        } else {
            // Si no se selecciona ningún archivo, resetea el estado.
            currentImage = null;
            loadingIndicator.style.display = 'none';
            fileNameSpan.textContent = 'Ningún archivo seleccionado.';
            drawMeme();
        }
    });

    // Event listeners para los inputs de texto y tamaño de fuente.
    // Cada vez que cambian, se actualiza el meme.
    topText.addEventListener('input', drawMeme);
    bottomText.addEventListener('input', drawMeme);

    topTextSizeInput.addEventListener('input', () => {
        topTextSizeValue.textContent = `${topTextSizeInput.value}px`; // Actualiza el indicador visual del tamaño.
        drawMeme();
    });

    bottomTextSizeInput.addEventListener('input', () => {
        bottomTextSizeValue.textContent = `${bottomTextSizeInput.value}px`; // Actualiza el indicador visual del tamaño.
        drawMeme();
    });

    /**
     * Maneja el evento de clic del botón de descarga.
     * Si hay una imagen cargada, convierte el contenido del canvas a Data URL PNG
     * y lo descarga como un archivo 'mi-meme.png'.
     */
    downloadMeme.addEventListener('click', () => {
        if (currentImage) {
            const dataURL = memeCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'mi-meme.png'; // Nombre del archivo a descargar.
            link.href = dataURL;
            document.body.appendChild(link); // Necesario para Firefox.
            link.click();
            document.body.removeChild(link); // Limpia el DOM.
        } else {
            alert('Por favor, carga una imagen antes de descargar el meme.');
        }
    });

    // Dibuja el estado inicial del canvas (mensaje "no image") cuando la página carga.
    console.log('DOM Content Loaded. Initializing canvas state on page load.');
    drawMeme();

    // --- Lógica para Dark Mode ---
    const K_CURRENT_THEME = 'memeGeneratorTheme'; // Key para localStorage

    /**
     * Aplica el tema (dark/light) al body y actualiza el texto del botón de toggle.
     * @param {string} theme - El tema a aplicar ("dark" o "light").
     */
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            if (darkModeToggle) darkModeToggle.textContent = '☀️'; // Sun emoji for light mode switch
        } else {
            document.body.classList.remove('dark-mode');
            if (darkModeToggle) darkModeToggle.textContent = '🌙'; // Moon emoji for dark mode switch
        }
    }

    // Verifica si hay un tema guardado en localStorage al cargar la página.
    const savedTheme = localStorage.getItem(K_CURRENT_THEME);
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Opcional: Podría comprobar las preferencias del sistema aquí.
        // Por ahora, se establece 'light' como tema por defecto si no hay nada guardado.
        applyTheme('light'); // Tema por defecto.
    }

    // Event listener para el botón de toggle del modo oscuro.
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            let newTheme;
            // Determina el nuevo tema basado en la clase actual del body.
            if (document.body.classList.contains('dark-mode')) {
                newTheme = 'light';
            } else {
                newTheme = 'dark';
            }
            applyTheme(newTheme); // Aplica el nuevo tema.
            localStorage.setItem(K_CURRENT_THEME, newTheme); // Guarda la preferencia.
        });
    } else {
        console.warn('Dark mode toggle button #darkModeToggle not found.');
    }
});
