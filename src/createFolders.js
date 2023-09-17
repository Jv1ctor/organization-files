import fs from "fs";
import path from "path";
import {mkdirp} from "mkdirp";

const baseDirectory = './src/sua_pasta_raiz'; // Altere para o diretório raiz onde deseja criar as pastas e arquivos
const numFolders = 5; // Número de pastas
const numFilesPerFolder = 10; // Número de arquivos por pasta

function getRandomDate() {
  const start = new Date(2022, 0, 1).getTime();
  const end = new Date(2023, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start));
}

function createRandomFolders() {
  for (let i = 1; i <= numFolders; i++) {
    const folderName = `pasta_${i}`;
    const folderPath = path.join(baseDirectory, folderName);

    if (!fs.existsSync(folderPath)) {
      mkdirp.sync(folderPath); // Cria a pasta
    }

    // Defina datas de modificação aleatórias para as pastas
    const randomModificationDate = getRandomDate();
    fs.utimesSync(folderPath, randomModificationDate, randomModificationDate);

    createRandomFiles(folderPath);
  }
}

function createRandomFiles(folderPath) {
  for (let i = 1; i <= numFilesPerFolder; i++) {
    const fileName = `arquivo_${i}.txt`;
    const filePath = path.join(folderPath, fileName);

    // Crie o arquivo com algum conteúdo aleatório
    const fileContent = `Conteúdo aleatório para ${fileName}`;
    fs.writeFileSync(filePath, fileContent);

    // Defina datas de modificação aleatórias para os arquivos
    const randomModificationDate = getRandomDate();
    fs.utimesSync(filePath, randomModificationDate, randomModificationDate);

    console.log(`Arquivo criado: ${filePath}, Data de modificação: ${randomModificationDate}`);
  }
}

createRandomFolders();
