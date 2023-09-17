import fs from "fs"
import path from "path"

const folderOrigin = "src/sua_pasta_raiz"
const folderDestination = "src/folders"
const emptyDirectoriesToDelete: string[] = []
let counter = 0

const verifyFolders = (folderPath: string, destinationFolderPath: string) => {
  const label = `tempo-de-execucao-${counter}`
  console.time(label)
  counter++
  
  const files = fs.readdirSync(folderPath)
  
  files.forEach((file) => {
    const dir = path.join(folderPath, file)
    const destinationPath = path.join(destinationFolderPath, file)

    const statsFiles = fs.statSync(dir)
    const dateCreateFolder = new Date(statsFiles.mtimeMs)
    const yearCreateFolder = dateCreateFolder.getFullYear()
    const currentYear = 2023
    const time = currentYear > yearCreateFolder

    if (statsFiles.isDirectory()) {
      if(!fs.existsSync(destinationPath)){
        fs.mkdirSync(destinationPath)
      }
      verifyFolders(dir, destinationPath)
      if (fs.readdirSync(dir).length === 0) {
        emptyDirectoriesToDelete.push(dir)
      }
    } else {
      if(time){
        fs.copyFileSync(dir, destinationPath)
        fs.unlinkSync(dir)
      }
    }
  })
  console.timeEnd(label)
}

verifyFolders(folderOrigin, folderDestination)

emptyDirectoriesToDelete.forEach((dir) => {
  fs.rmdirSync(dir)
})
