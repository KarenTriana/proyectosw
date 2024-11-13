const pb = new PocketBase('http://127.0.0.1:8090'); // Cambia a la URL de tu servidor PocketBase

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const direccion = document.getElementById('direccion').value;
    const tipo_documento = document.getElementById('tipo_documento').value;
    const numero_documento = document.getElementById('numero_documento').value;
    const errorMessage = document.getElementById('register-error-message');
    const successMessage = document.getElementById('register-success-message');
    
    errorMessage.textContent = '';
    successMessage.textContent = '';

    const confirmPassword = document.getElementById('confirmPassword').value;
 
    // Verificar si el correo ya está registrado
    const emailExists = await pb.collection('users').getList(1, 1, { filter: `email="${email}"` });
    if (emailExists.items.length > 0) {
    errorMessage.textContent = 'El correo electrónico ya está registrado.';
    return;
    }


     // Verificar si el nombre de usuario ya está registrado
     const usernameExists = await pb.collection('users').getList(1, 1, { filter: `username="${username}"` });
    if (usernameExists.items.length > 0) {
    errorMessage.textContent = 'El nombre de usuario ya está registrado.';
    return;
    }


    // Validación de contraseña (al menos 5 caracteres, 1 mayúscula, 1 carácter especial)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{5,}$/;
    if (!passwordRegex.test(password)) {
        errorMessage.textContent = 'La contraseña debe tener al menos 5 caracteres, una letra mayúscula y un carácter especial.';
        return;
    }

    // Verificar que las contraseñas coinciden
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Las contraseñas no coinciden.';
        return;
    }

    // Validar el número de teléfono colombiano
    const phoneRegexColombia = /^(?:\+57|57)?(?:3[0-9]{9}|1[1-9][0-9]{6,7}|[2-9][0-9]{7,8})$/;
    if (!phoneRegexColombia.test(phone)) {
        errorMessage.textContent = 'El número de teléfono no es válido. Debe ser un número colombiano (móvil o fijo).';
        return;
    }

    // Validar que el número de documento tenga entre 8 y 15 dígitos
    const docRegex = /^\d{8,15}$/;
    if (!docRegex.test(numero_documento)) {
        errorMessage.textContent = 'El número de documento debe tener entre 8 y 15 dígitos.';
        return;
    }

    // Verificar si el número de documento ya está registrado
    const docExists = await pb.collection('users').getList(1, 1, { filter: `numero_documento="${numero_documento}"` });
    if (docExists.items.length > 0) {
    errorMessage.textContent = 'El número de documento ya está registrado.';
    return;
    }


    try {
        console.log('Registrando usuario con los siguientes datos:', {
            email,
            username,
            password,
            name,
            telefono: phone,
            direccion,
            tipo_documento,
            numero_documento,
        });

        // Crear un nuevo usuario en la colección `users`
        await pb.collection('users').create({
            email: email,
            username: username,
            password: password,
            passwordConfirm: password,  // Confirmación de contraseña
            name: name,
            telefono: phone,
            direccion: direccion,
            tipo_documento: tipo_documento,
            numero_documento: numero_documento, 
            role: 'usuario'
        });
        
        successMessage.textContent = 'Registro exitoso. Ahora puedes iniciar sesión.';
        
        // Redirigir al login
        window.location.href = '/vista/login-pocketbase.html';  

    } catch (error) {
        errorMessage.textContent = 'Error en el registro: ' + error.message;
        console.error('Error en el registro:', error);
    }
});
