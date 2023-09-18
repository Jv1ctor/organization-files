import fs from "fs/promises"
import path from "path"

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

const verifyFolders = async (
  folderPath: string,
  destinationFolderPath: string
) => {
  const label = `tempo-de-execucao-${counter}`
  console.time(label)
  counter++

  const files = await filesReaddir(folderPath)
  const promisesFiles = files.map(async (file) => {
    try {
      const dir = path.join(folderPath, file)
      const destinationPath = path.join(destinationFolderPath, file)

      const statsFiles = await fs.stat(dir)
      const time = dateFolder(statsFiles)
      
      if (statsFiles.isDirectory()) {
        fs.mkdir(destinationPath)
        verifyFolders(dir, destinationPath)
        await emptyFolder(dir)
      } else {
        if (time) {
          fs.copyFile(dir, destinationPath)
          fs.unlink(dir)
        }
      }
    } catch (err) {
      console.log("error in process", err)
    }
  })

  Promise.all(promisesFiles)
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
