import React, {useState,useEffect,useRef}from 'react';
import Modal from '@custom/shared/components/Modal';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import Button from '../Button';
import Tile from '@custom/shared/components/Tile';
import useMessageSound from '@custom/shared/hooks/useMessageSound';
import{ ReactComponent as IconBot} from '@custom/shared/icons/bot.svg';
export const PRECALL_TEST_MODAL = 'precall-test';

export const PreCallTestModal = () => {
  const { currentModals, closeModal } = useUIState();
  const [messageHistory, setMessageHistory] = useState([]);
    const [buttonText, setButtonText] = useState("");
    const [newButtonText, setNewButtonText] = useState("");
    const [showNewButton, setShowNewButton] = useState(false);
    const [listening, setListening] = useState(true);
    let isListening = true;
    const [loading, setLoading] = useState(false);
    const [testType, setTestType] = useState("speakers");
    const [showVideo, setShowVideo] = useState(false);
const {localParticipant} = useParticipants();
const {callObject} = useCallState();
    const playMessageSound = useMessageSound();
    const chatWindowRef = useRef();

  async  function getLocalStream() {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(function(stream) {
          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);
          const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
      
          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;
      
          microphone.connect(analyser);
          analyser.connect(scriptProcessor);
          scriptProcessor.connect(audioContext.destination);
          scriptProcessor.onaudioprocess = function() {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            const arraySum = array.reduce((a, value) => a + value, 0);
            const average = arraySum / array.length;
            if(isListening && average > 0 && average<20){
              console.log('listening');
            setTimeout(() => {
              messageHistory.push({
                isLocal: true,
                message:"Listening... Please speak into the microphone."
              })
              setMessageHistory(messageHistory)
            }, 200);
            isListening = false;
          }

            if(average > 0 && average>20){
              setTimeout(() => {
                
              messageHistory.push({
                isLocal: true,
                message: "Great! Your microphone is working. Now, let's test your camera. Click Test Camera."
              })
              setMessageHistory(messageHistory)
              setButtonText("Test Camera");
              setLoading(false);
            }, 3000);
              microphone.disconnect();
              analyser.disconnect();
              scriptProcessor.disconnect();
            }
            else if(average === 0){
              messageHistory.push({
                isLocal: true,
                message: "Hmm, I can't hear you. Please check that your microphone is on and try again."
              })
              setMessageHistory(messageHistory)
              setButtonText("Try Again");
              setShowNewButton(true);
              setLoading(false);
            }
          };
        })
        .catch((err) => {
          console.error(`you got an error: ${err}`);
          return false;
        });
    }
    
const handleNewMessage =async () => {
  setLoading(true);
    if(buttonText === "Start"){
        setTimeout(() => {
        messageHistory.push({
            isLocal: false,
            message:"Yes! I'm ready to start."
        })
        setMessageHistory(messageHistory)
      }, 200);
      setTimeout(() => {
        messageHistory.push({
            isLocal: true,
            message: "Great! First, let's test your speakers (or headphones). Click Play!"
        })
        setMessageHistory(messageHistory)
        setButtonText("Play")
        setLoading(false);
      }, 3000);
        
    }
    else if(buttonText === "Play"){
      setTimeout(() => {
        messageHistory.push({
            isLocal: false,
            message:"Play!"
        })
        setMessageHistory(messageHistory)
      }, 200);

      setTimeout(() => {
           /*play sound until user clicks "Yes"*/
       playMessageSound()
        }, 1000);

      setTimeout(() => {
        messageHistory.push({
            isLocal: true,
            message:"Did you hear the sound?"
        })
        setMessageHistory(messageHistory)
        setButtonText("Yes");
        setNewButtonText("No");
        setShowNewButton(true); 
        setLoading(false);
      }, 3000);
    }
    else if(buttonText === "Yes" && testType === "speakers"){
      setTimeout(() => {
        messageHistory.push({
            isLocal: false,
            message:"Yes!"
        })
        setMessageHistory(messageHistory)
      }, 200);
      setTimeout(() => {
        messageHistory.push({
            isLocal: true,
            message:"Great! That means you will be able to hear other participants on the call."
        })
        setMessageHistory(messageHistory)
        setNewButtonText("");
        setShowNewButton(false);
        
      }, 3000);
      setTimeout(() => {
        messageHistory.push({
            isLocal: true,
            message:"Next, let's test your microphone and camera. To test i will ask for the permission to access your camera and microphone. Click Allow."
        })
        setMessageHistory(messageHistory)
        setButtonText("Allow");
        setNewButtonText("");
        setShowNewButton(false);
        setLoading(false);
      },3500);
    }
    else if(buttonText === "Allow"){
      setTimeout(() => {
        messageHistory.push({
            isLocal: false,
            message:"Allow!"
        })
        setMessageHistory(messageHistory)
      }, 200);
      setTimeout(async() => {
       getLocalStream();
      }, 1000);
    }
    else if(buttonText === "Test Camera"){
      setTestType("camera");
      setTimeout(() => {
        messageHistory.push({
            isLocal: false,
            message:"Show Video!"
        })
        setMessageHistory(messageHistory)
      }, 200);
      callObject.setLocalVideo(true);
      setTimeout(() => {
        messageHistory.push({
            isLocal: true,
            message:"Are you able to see yourself?"
        })
        setMessageHistory(messageHistory)
        setButtonText("Yes"); 
        setNewButtonText("No");
        setShowNewButton(true);
        setLoading(false);
        setShowVideo(true);
      }, 3000);
      }
      else if(buttonText === "Yes" && testType === "camera"){
        setTimeout(() => {
          messageHistory.push({
              isLocal: false,
              message:"Yes!"
          })
          setMessageHistory(messageHistory)
          setShowVideo(false);

        }, 200);
        callObject.setLocalVideo(false);
        setTimeout(() => {
          messageHistory.push({
              isLocal: true,
              message:"Great! You are all set. See you soon!"
          })
          setMessageHistory(messageHistory)
          setNewButtonText("");
          setShowNewButton(false);
          setButtonText("Bye");
          setLoading(false);
        }, 3000);
        }
        else if(buttonText === "Bye"){
          closeModal(PRECALL_TEST_MODAL);
          setButtonText("Start");
          setNewButtonText("");
          setLoading(false);
          setListening(true);
          isListening = true;
          setShowNewButton(false);
          setShowVideo(false);
          setTestType("speakers");
          setMessageHistory([]);
          callObject.setLocalVideo(false);
        }
        else if(buttonText === "Play Again"){
          setTimeout(() => {
            messageHistory.push({
                isLocal: false,
                message:"Play Again!"
            })
            setMessageHistory(messageHistory)
          }, 200);
          setTimeout(() => {
            playMessageSound()
          }, 1000);
          setTimeout(() => {
            messageHistory.push({
                isLocal: true,
                message:"Did you hear the sound Now?"
            })
            setMessageHistory(messageHistory)
            setButtonText("Yes");
            
            setNewButtonText("Not Again");
            setShowNewButton(true); 
            setLoading(false);
          }, 3000);

        }
      }

  const handleNewError = () => {
        setLoading(true);
        if(newButtonText === "No" && testType === "speakers"){
          setTimeout(() => {
            messageHistory.push({
                isLocal: false,
                message:"No!"
            })
            setMessageHistory(messageHistory)
          }, 200);
          setTimeout(() => {
            messageHistory.push({
                isLocal: true,
                message:"Hmm,  Please check that your speakers are on or that your headphones are plugged in."
            })
            setMessageHistory(messageHistory)
            setButtonText("Play Again");
            setNewButtonText("");
            setShowNewButton(false);
            setLoading(false);
          }, 3000);
        }
        else if(newButtonText === "Not Again" && testType === "speakers"){
          setTimeout(() => {
            messageHistory.push({
                isLocal: false,
                message:"Not Again!"
            })
            setMessageHistory(messageHistory)
          }, 200);
          setTimeout(() => {
            messageHistory.push({
                isLocal: true,
                message:"It looks like you are having trouble with your speakers. Please check that your speakers are on or that your headphones are plugged in. If you are still having trouble, please try restarting your computer."
            })
            setMessageHistory(messageHistory)
            setButtonText("Bye");
            setNewButtonText("");
            setShowNewButton(false);
            setLoading(false);
          }, 3000);
        }
        else if(newButtonText === "No" && testType === "camera"){
          setTimeout(() => {
            messageHistory.push({
                isLocal: false,
                message:"No!"
            })
            setMessageHistory(messageHistory)
            setShowVideo(false);
          }, 200);
          setTimeout(() => {
            messageHistory.push({
                isLocal: true,
                message:"Hmm, Please check that your camera is on and that you are not blocking it. If you are still having trouble, please try restarting your computer."
            })
            setMessageHistory(messageHistory)
            setButtonText("Bye");
            setNewButtonText("");
            setShowNewButton(false);
            setLoading(false);
          }, 3000);
        }
  }

useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messageHistory?.length]);

useEffect(() => {
    console.log(messageHistory)
    if(currentModals[PRECALL_TEST_MODAL]){
    setTimeout(() => {
    messageHistory.push({
        isLocal: true,
        message: "Hi, I'm your fitness coach. Let's start with a pre-call test to make sure everything is working."
    }
    )
    setMessageHistory(messageHistory)
    setListening(true);
    isListening= true;
    setShowNewButton(false);
    setLoading(false);
    setShowVideo(false);
    setTestType("speakers");
  }, 1000);
    setTimeout(() => {
   setButtonText("Start")
  }, 2000);
}
}, [currentModals])

  return (
    <>
    <Modal
      title="Pre-Call Test"
      isOpen={currentModals[PRECALL_TEST_MODAL]}
      onClose={() =>{ 
        setMessageHistory([]);
        setButtonText("");
        setNewButtonText("");
        setShowNewButton(false);
        setLoading(false);
        setTestType("speakers");
        setShowVideo(false);
        setListening(true);
        isListening = true;
        closeModal(PRECALL_TEST_MODAL);
    }}
    >
      
          <div className='message-container' ref={chatWindowRef} >
            {messageHistory.map((message, index) => (
              <div className='bot-msg' key={index}>
             {message.isLocal ?   <span className='img'> <IconBot /> </span>:null}
                <div key={index} className={`message ${message.isLocal ? 'local' : 'remote'}`}>
                
                    {message.message}
                    </div>
                    </div>
            ))}
            {showVideo &&
             <div className='video-container'>
              <Tile 
              participant = {localParticipant}
              mirrored
              showName={false}
              />
              </div>
              }
        </div>
        
        <div className='button-container'>
           {buttonText!="" && !loading?(
            <>
        <Button onClick={() =>{ 
            handleNewMessage()
    }}>{buttonText}</Button>
      {showNewButton && <Button
      onClick={() =>{
        handleNewError()
      }}
      >{newButtonText}</Button>}
      </>
      )
        :null}
        </div>
        

    </Modal>
    <style jsx>{`
    .precall-test-modal {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
    }
    .message-container {
        height:50vh!important;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        overflow-y: auto!important;
        scroll-behavior: smooth!important;
      }
      .message-container .video-container {
        height: 200px;
        width: 200px;
        align-self: center;
        margin: var(--spacing-sm);
      }


      .message {
        margin: var(--spacing-xxs);
        padding: var(--spacing-xxs);
        background: var(--gray-wash);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        transition: display 0.5s ease;
      }
      .message.remote {
        background: var(--gray-light);
        width:max-content;
        margin-left: auto;
      }
        .message.local {
        background: var(--gray-wash);
        margin-right: auto;
        }
        .bot-msg {
          display: flex;
          align-items: center;

          justify-content: space-evenly;
        }
        .message-container .img {
          width: 50px;
          height: 50px;
          border-radius:50%;
          background: var(--gray-wash);
          display: flex;
          align-items: center;
          justify-content: center;
        }
    .button-container {
        display: flex;
        justify-content:space-evenly;
        align-items: center;
        height: 10vh!important;
    }
    `}</style>
    </>
  );
};

export default PreCallTestModal;
