import fs from "fs/promises"
import path from "path"
import fsStream from "fs"
import cluster from "cluster"

const folderOrigin = "src/sua_pasta_raiz"
const folderDestination = "src/folders"
const emptyDirectoriesToDelete: string[] = []
let counter = 0

interface StastFiles {
  mtime: Date
}

const filesReaddir = async (path: string) => fs.readdir(path)

const dateFolder = (stats: StastFiles) => {
  const dateCreateFolder: Date = stats.mtime
  const yearCreateFolder = dateCreateFolder.getFullYear()
  const currentYear = new Date().getFullYear()
  return currentYear > yearCreateFolder
}

const emptyFolder = async (path: string) => {
  const files = await filesReaddir(path)
  if (files.length === 0) {
    emptyDirectoriesToDelete.push(path)
  }
}

const copyFile = async (src: string, dest: string) => {
  return new Promise<void>((resolve, reject) => {
    const readder = fsStream.createReadStream(src)
    const writter = fsStream.createWriteStream(dest)

    readder.on("error", reject)
    writter.on("error", reject)

    readder.pipe(writter)
    readder.on("end", () => {
      // fs.unlink(src)
      //   .then(() => resolve())
      //   .catch(reject);
      resolve()
    })
  })
}

const verifyFolders = async (
  folderPath: string,
  destinationFolderPath: string
) => {
  const label = `tempo-de-execucao-${counter}`
  counter++
  console.time(label)
  let files = await filesReaddir(folderPath)
  const numChildProcesses = 2 // Número de processos filhos
  const filesPerProcess = Math.ceil(files.length / numChildProcesses)

  const fileSubsets = []
  for (let i = 0; i < numChildProcesses; i++) {
    const startIndex = i * filesPerProcess
    const endIndex = startIndex + filesPerProcess
    fileSubsets.push(files.slice(startIndex, endIndex))
  }

  if (cluster.isPrimary) {
    console.log(`processo principal criado: ${process.pid}`)

    for (let i = 0; i < numChildProcesses; i++) {
      console.log(`processo filho criado: ${i}`)
      const child = cluster.fork()
      const fileSubset = fileSubsets[i]

      child.send({ files: fileSubset }) // Enviar subconjunto de arquivos para o processo filho
    }

    cluster.on("exit", (worker, _code, _signal) => {
      console.log(`Processo ${worker.process.pid} finalizado`)
      cluster.fork()
    })
  } else {
    process.on("message", async (message: any) => {
      const { files: fileSubset } = message
      for (const file of fileSubset) {
       console.log(file)
      }
    })
  }
  console.timeEnd(label)
}


const main = async () => {
  await verifyFolders(folderOrigin, folderDestination)

  for (const dir of emptyDirectoriesToDelete) {
    fs.rmdir(dir)
  }
}

main().catch((err) => {
  console.error("Erro principal:", err)
})
