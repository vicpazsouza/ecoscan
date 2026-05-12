const video = document.getElementById("camera");

let currentFacingMode = "environment";
let streamAtual;

// 🎥 iniciar câmera
async function iniciarCamera() {
  if (streamAtual) {
    streamAtual.getTracks().forEach(track => track.stop());
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode }
    });

    streamAtual = stream;
    video.srcObject = stream;

  } catch (err) {
    alert("Erro ao acessar câmera: " + err);
  }
}

// 🔄 trocar câmera
function trocarCamera() {
  currentFacingMode =
    currentFacingMode === "environment" ? "user" : "environment";

  iniciarCamera();
}

// iniciar ao carregar
iniciarCamera();

// Capturar imagem
function tirarFoto() {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  context.drawImage(video, 0, 0);

  const imagem = canvas.toDataURL("image/jpeg");

  analisarImagem(imagem);
}

// Análise com Groq Vision
async function analisarImagem(imagemBase64) {
  const resultado = document.getElementById("resultado");
  resultado.innerText = "Analisando...";

  try {
    const response = await fetch(
     "/api/analisar",
{
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: 'Observe a imagem e identifique o tipo de material de lixo/reciclagem. Responda apenas um JSON com a chave "tipo" e um dos valores: Plástico, Metal, Papel, Vidro, Orgânico, Eletrônico, Não reciclável. Exemplo: {"tipo": "Plástico"}',
                },
                {
                  type: "image_url",
                  image_url: { url: imagemBase64 },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_completion_tokens: 256,
        }),
      },
    );

    const data = await response.json();
    const tipo = JSON.parse(data.choices[0].message.content).tipo;
    mostrarResultado(tipo);
  } catch (err) {
    resultado.innerText = "Erro ao analisar: " + err.message;
  }
}

// resultado
function mostrarResultado(tipo) {
let endereco = "\n Ecoponto Corlumb - Vargem Pequena \n Estr. dos Bandeirantes, 11227 \n Vargem Pequena - RJ, 22783-117";

  let dica = "";

  if (tipo === "Plástico") {
    dica = "Lave embalagens antes de descartar ♻️";
  }
   if (tipo === "Não reciclável") {
    dica = "Esse material não é reciclável. Sempre que possível, reduza o uso e descarte corretamente no lixo comum";
  }

  if (tipo === "Metal") {
    dica = "Latas são 100% recicláveis!";
  }

  if (tipo === "Papel") {
    dica = "Evite papel molhado para reciclagem";
  }

  if (tipo === "Vidro") {
    dica = "Cuidado com vidro quebrado!";
  }

  document.getElementById("resultado").innerText = `Tipo: ${tipo}
Descarte em: ${endereco}

💡 ${dica}`;
}
