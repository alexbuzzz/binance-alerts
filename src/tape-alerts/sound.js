import sound1 from '@/assets/sound/1.mp3'
import sound2 from '@/assets/sound/2.mp3'
import sound3 from '@/assets/sound/3.mp3'
import sound4 from '@/assets/sound/4.mp3'
import sound5 from '@/assets/sound/5.mp3'
import sound6 from '@/assets/sound/6.mp3'
import sound7 from '@/assets/sound/7.mp3'
import sound8 from '@/assets/sound/8.mp3'
import sound9 from '@/assets/sound/9.mp3'
import sound10 from '@/assets/sound/10.mp3'

const playSound = (sound) => {
  let soundFile

  switch (sound) {
    case 'sound1':
      soundFile = sound1
      break
    case 'sound2':
      soundFile = sound2
      break
    case 'sound3':
      soundFile = sound3
      break
    case 'sound4':
      soundFile = sound4
      break
    case 'sound5':
      soundFile = sound5
      break
    case 'sound6':
      soundFile = sound6
      break
    case 'sound7':
      soundFile = sound7
      break
    case 'sound8':
      soundFile = sound8
      break
    case 'sound9':
      soundFile = sound9
      break
    case 'sound10':
      soundFile = sound10
      break
    default:
      console.error('Invalid sound selection:', sound)
      return
  }

  const audio = new Audio(soundFile)
  audio.play()
}

export default playSound
