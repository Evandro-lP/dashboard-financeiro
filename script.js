const form = document.querySelector("form")

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

const emailError = document.getElementById("email-error");
const senhaError = document.getElementById("senha-error");

const btn = document.getElementById("btn");

form.addEventListener("submit", (e) => {
     
    e.preventDefault();

    let isValid = true;

    // limpa tudo antes de validar
    emailError.textContent = "";
    senhaError.textContent = "";

    emailInput.classList.remove("input-error");
    senhaInput.classList.remove("input-error");

    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();

    // EMAIL
    if (!email.includes("@")) {
        emailError.textContent = "Email inválido";
        emailInput.classList.add("input-error");
        isValid = false;
    }

    // SENHA
    if (senha.length < 6) {
        senhaError.textContent = "Senha deve ter 6+ caracteres";
        senhaInput.classList.add("input-error");
        isValid = false;
    }

    if (isValid) {
        btn.textContent = "Entrando...";
        btn.disabled = true;

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    }

});

emailInput.addEventListener("input", () => {
    emailError.textContent = "";
    emailInput.classList.remove("input-error");
});

senhaInput.addEventListener("input", () => {
    senhaError.textContent = "";
    senhaInput.classList.remove("input-error");
});