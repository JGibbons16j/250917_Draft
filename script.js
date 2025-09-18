    document.addEventListener('DOMContentLoaded', function() {
    const tempReveal = document.querySelector('.temp-reveal');
    const cursorCircle = document.querySelector('.cursor-circle');
    const container = document.querySelector('.container');
    const canvas = document.querySelector('.reveal-canvas');
    const ctx = canvas.getContext('2d');
    
    let mouseX = 0;
    let mouseY = 0;
    let isMouseInside = false;
    let hiddenImg = null;
    
    // Base reveal size
    const baseRevealSize = 120;
    let currentRevealSize = 0;
    
    // Canvas setup
    function setupCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Load hidden image
        hiddenImg = new Image();
        hiddenImg.onload = function() {
            // Canvas is ready for drawing
        };
        hiddenImg.src = 'images/hidden_image.jpg';
    }
    
    // Initialize canvas
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    
    // Draw permanent reveal on canvas with gradient effect
    function drawPermanentReveal(x, y, radius) {
        if (!hiddenImg || !hiddenImg.complete) return;
        
        // Calculate image scaling to cover canvas
        const imgAspect = hiddenImg.width / hiddenImg.height;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
            drawHeight = canvas.height;
            drawWidth = drawHeight * imgAspect;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
        } else {
            drawWidth = canvas.width;
            drawHeight = drawWidth / imgAspect;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
        }
        
        // Save context state
        ctx.save();
        
        // Create radial gradient for soft edges
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');      // Fully opaque center
        gradient.addColorStop(0.4, 'rgba(0,0,0,1)');    // Solid core
        gradient.addColorStop(0.7, 'rgba(0,0,0,0.8)');  // Start fade
        gradient.addColorStop(0.9, 'rgba(0,0,0,0.3)');  // More fade
        gradient.addColorStop(1, 'rgba(0,0,0,0)');      // Transparent edge
        
        // Create a mask using the gradient
        ctx.globalCompositeOperation = 'source-over';
        
        // Draw a circle with gradient as mask
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Now use this as a mask for the image
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(hiddenImg, drawX, drawY, drawWidth, drawHeight);
        
        // Change composite operation back to normal for next draws
        ctx.globalCompositeOperation = 'source-over';
        
        // Restore context
        ctx.restore();
    }
    
    // Update cursor position and reveal effect
    function updateCursor(e) {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 100;
        mouseY = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Canvas coordinates
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Update temporary reveal CSS
        tempReveal.style.setProperty('--x', mouseX + '%');
        tempReveal.style.setProperty('--y', mouseY + '%');
        tempReveal.style.setProperty('--size', currentRevealSize + 'px');
        
        // Draw permanent reveal as user moves
        if (isMouseInside && currentRevealSize > 0) {
            drawPermanentReveal(canvasX, canvasY, currentRevealSize * 0.8); // Slightly smaller for smooth effect
        }
        
        // Update cursor circle position
        cursorCircle.style.left = e.clientX + 'px';
        cursorCircle.style.top = e.clientY + 'px';
    }
    
    // Mouse enter container
    container.addEventListener('mouseenter', function(e) {
        isMouseInside = true;
        cursorCircle.style.opacity = '1';
        animateRevealSize(baseRevealSize);
        updateCursor(e);
    });
    
    // Mouse move within container
    container.addEventListener('mousemove', function(e) {
        if (isMouseInside) {
            updateCursor(e);
        }
    });
    
    // Mouse leave container
    container.addEventListener('mouseleave', function() {
        isMouseInside = false;
        cursorCircle.style.opacity = '0';
        animateRevealSize(0);
    });
    
    // Animate reveal size changes
    function animateRevealSize(targetSize) {
        const startSize = currentRevealSize;
        const duration = 300; // ms
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            currentRevealSize = startSize + (targetSize - startSize) * easeOut;
            
            if (isMouseInside || targetSize === 0) {
                tempReveal.style.setProperty('--size', currentRevealSize + 'px');
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Touch support for mobile devices
    container.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        
        mouseX = ((touch.clientX - rect.left) / rect.width) * 100;
        mouseY = ((touch.clientY - rect.top) / rect.height) * 100;
        
        const canvasX = touch.clientX - rect.left;
        const canvasY = touch.clientY - rect.top;
        
        tempReveal.style.setProperty('--x', mouseX + '%');
        tempReveal.style.setProperty('--y', mouseY + '%');
        tempReveal.style.setProperty('--size', '80px');
        
        // Draw permanent reveal on touch
        drawPermanentReveal(canvasX, canvasY, 80);
    });
    
    container.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        
        mouseX = ((touch.clientX - rect.left) / rect.width) * 100;
        mouseY = ((touch.clientY - rect.top) / rect.height) * 100;
        
        const canvasX = touch.clientX - rect.left;
        const canvasY = touch.clientY - rect.top;
        
        tempReveal.style.setProperty('--x', mouseX + '%');
        tempReveal.style.setProperty('--y', mouseY + '%');
        
        // Draw permanent reveal on touch move
        drawPermanentReveal(canvasX, canvasY, 80);
    });
    
    container.addEventListener('touchend', function(e) {
        e.preventDefault();
        tempReveal.style.setProperty('--size', '0px');
    });
    
    // Initialize
    tempReveal.style.setProperty('--x', '50%');
    tempReveal.style.setProperty('--y', '50%');
    tempReveal.style.setProperty('--size', '0px');
    cursorCircle.style.opacity = '0';
    
    // Preload images for better performance
    const coverImage = new Image();
    const hiddenImage = new Image();
    coverImage.src = 'images/cover_image.jpg';
    hiddenImage.src = 'images/hidden_image.jpg';
});