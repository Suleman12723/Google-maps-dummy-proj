import { useLoadScript } from '@react-google-maps/api';
import Map from './components/Map'
import { useState } from 'react';
import axios from 'axios';
import SetLocationMap from './components/SetLOcationMap';

//liabraries to be used with googleMaps
const libraries = ['places','geometry']


/*
*  Start json-server --watch data/data.json
*  Start npm start also  
*
*  You will have to refresh after signup call is sent. Because this is not Router DOM.
*
*/



function App() {
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [login ,setLogin] = useState(true);
  const [propdata, setData] = useState(null);
  const [signUp, setSignUp] = useState(false);






    const handleClick = async()=>{
        const data = await axios.get(`http://localhost:3000/dealers?Name=${name}`);

        if(data){
          if( data.data[0].Password === pass){
            setData(data.data[0]);
            setLogin(false);
            setLoggedIn(true);
          }
          else{
            alert('Incorrect Credentials!');
          }
        }
  }



    const handleSignUpClick = ()=>{
      setSignUp(true);
      setLogin(false);
    }

  const {isLoaded} = useLoadScript({                                 //checks if completely loaded or not
    googleMapsApiKey:'YOUR API KEY HERE',     //API key
    libraries:libraries
  })

  if(login){
    return <><input type={'text'} value={name} placeholder='Enter your Name here ...' onChange={(e)=>{setName(e.target.value)}} />
    <input type={'password'} value={pass} placeholder='Enter your Password here ...' onChange={(e)=>{setPass(e.target.value)}} />
    <button onClick={handleClick}>Submit</button>
    <button onClick={handleSignUpClick}>SignUp</button></>
  }
  else if(signUp){
    if(!isLoaded) return <div>Loading ...</div>                       //if not is loaded returns a text Loading ....
    return <SetLocationMap/>
    
  }
  else if(loggedIn && !login){
  if(!isLoaded) return <div>Loading ...</div>                       //if not is loaded returns a text Loading ....
  return <Map data={propdata}/>                                                    //if yes then returns  the GOOGLE MAP
  }
}

export default App;
