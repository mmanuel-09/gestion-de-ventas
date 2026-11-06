
import { useState } from 'react'

const desktopMessage =
  'Esta función está disponible en la aplicación de escritorio de LOGU. La demo web no crea ni restaura archivos de respaldo.'

function useBackups() {
  const [backupMessage, setBackupMessage] = useState('')

  function createBackup() {
    setBackupMessage(desktopMessage)
  }

  function restoreBackup() {
    setBackupMessage(desktopMessage)
  }

  return {
    backupMessage,
    backupError: '',
    createBackup,
    restoreBackup,
  }
}

export default useBackups
