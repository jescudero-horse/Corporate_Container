//Get an instance of the socket
const socket = io();

console.log("Socket actual", socket)

//Apply the funcionality for the send button
document.getElementById('enviar').onclick = () => {
    //Store the question
    const pregunta = document.getElementById('pregunta').value;

    //If the question is empty
    if (pregunta.trim() === "") {
        //Call the method to display the alert message
        notEmptyQuestion();
        return;
    }

    //Send the question
    socket.emit('preguntar', pregunta);

    //Delete the question input value
    document.getElementById('pregunta').value = '';
};

//Apply the funcionality for the answers question
socket.on('respuesta', (respuesta) => {
    //Create an instance of the answers div
    const divRespuestas = document.getElementById('respuestas');

    //Send the answer
    divRespuestas.innerHTML += `<p>${respuesta}</p>`;
});

/**
 * Function to display the error message
 */
function notEmptyQuestion() {
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You can't send empty questions",
    });
}