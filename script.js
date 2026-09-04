const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const dropText = document.getElementById("dropText");
const preview = document.getElementById("preview");
const classifyBtn = document.getElementById("classifyBtn");
const resultSection = document.getElementById("result");
const resultLabel = document.getElementById("resultLabel");
const resultBreed = document.getElementById("resultBreed");
const resultConfidence = document.getElementById("resultConfidence");
const statusEl = document.getElementById("status");

// ImageNet's 5 domestic cat classes (indices 281-285).
const CAT_CLASSES = ["tabby", "tiger cat", "persian cat", "siamese cat", "egyptian cat"];

// ImageNet dog breed classes (indices 151-268), lowercase keywords.
const DOG_KEYWORDS = [
  "chihuahua", "japanese spaniel", "maltese", "pekinese", "shih-tzu", "blenheim spaniel",
  "papillon", "toy terrier", "rhodesian ridgeback", "afghan hound", "basset", "beagle",
  "bloodhound", "bluetick", "coonhound", "walker hound", "english foxhound", "redbone",
  "borzoi", "irish wolfhound", "italian greyhound", "whippet", "ibizan hound",
  "norwegian elkhound", "otterhound", "saluki", "scottish deerhound", "weimaraner",
  "staffordshire bullterrier", "american staffordshire terrier", "bedlington terrier",
  "border terrier", "kerry blue terrier", "irish terrier", "norfolk terrier",
  "norwich terrier", "yorkshire terrier", "fox terrier", "lakeland terrier",
  "sealyham terrier", "airedale", "cairn", "australian terrier", "dandie dinmont",
  "boston bull", "boston terrier", "schnauzer", "scotch terrier", "tibetan terrier",
  "silky terrier", "wheaten terrier", "west highland white terrier", "lhasa",
  "flat-coated retriever", "curly-coated retriever", "golden retriever",
  "labrador retriever", "chesapeake bay retriever", "german short-haired pointer",
  "vizsla", "english setter", "irish setter", "gordon setter", "brittany spaniel",
  "clumber", "english springer", "welsh springer spaniel", "cocker spaniel",
  "sussex spaniel", "irish water spaniel", "kuvasz", "schipperke", "groenendael",
  "malinois", "briard", "kelpie", "komondor", "old english sheepdog",
  "shetland sheepdog", "collie", "bouvier des flandres", "rottweiler",
  "german shepherd", "doberman", "miniature pinscher", "swiss mountain dog",
  "bernese mountain dog", "appenzeller", "entlebucher", "boxer", "bull mastiff",
  "tibetan mastiff", "french bulldog", "great dane", "saint bernard", "eskimo dog",
  "husky", "affenpinscher", "basenji", "pug", "leonberg", "newfoundland",
  "great pyrenees", "samoyed", "pomeranian", "chow", "keeshond", "brabancon griffon",
  "pembroke", "cardigan", "poodle", "mexican hairless", "malamute",
];

const MIN_CONFIDENCE = 0.15;

let currentImageEl = null;
let model = null;

function setStatus(text) {
  statusEl.textContent = text;
}

function classifyClassName(name) {
  const lower = name.toLowerCase();
  if (CAT_CLASSES.some((c) => lower.includes(c))) return "cat";
  if (DOG_KEYWORDS.some((d) => lower.includes(d))) return "dog";
  return null;
}

async function loadModel() {
  setStatus("모델을 불러오는 중...");
  model = await mobilenet.load();
  setStatus("준비 완료. 사진을 올려주세요.");
}

function showPreview(file) {
  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.hidden = false;
  dropText.hidden = true;
  currentImageEl = preview;
  classifyBtn.disabled = false;
  resultSection.hidden = true;
}

async function classifyImage() {
  if (!model || !currentImageEl) return;
  classifyBtn.disabled = true;
  setStatus("판별 중...");

  const predictions = await model.classify(currentImageEl, 5);
  const match = predictions
    .map((p) => ({ ...p, kind: classifyClassName(p.className) }))
    .find((p) => p.kind !== null && p.probability >= MIN_CONFIDENCE);

  resultSection.hidden = false;
  if (match) {
    resultLabel.textContent = match.kind === "cat" ? "고양이예요!" : "개예요!";
    resultBreed.textContent = match.className;
    resultConfidence.textContent = `${(match.probability * 100).toFixed(1)}%`;
  } else {
    resultLabel.textContent = "글쎄요!";
    resultBreed.textContent = `가장 유력한 추측: ${predictions[0].className}`;
    resultConfidence.textContent = `${(predictions[0].probability * 100).toFixed(1)}%`;
  }

  setStatus("");
  classifyBtn.disabled = false;
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) showPreview(file);
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    showPreview(file);
  }
});

classifyBtn.addEventListener("click", classifyImage);

loadModel();
