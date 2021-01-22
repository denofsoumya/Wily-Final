import React from 'react';
import {Text,View,TouchableOpacity,StyleSheet,Image, Alert,KeyboardAvoidingView ,ToastAndroid} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import firebase from 'firebase'

export default class LoginScreen extends React.Component{
    constructor(){
        super()
            this.state={
                emailId:'',
                password:''
            }
        }
    
        login=async(email,password)=>{
            if(email,password){
              
                try{
                    
                    const response=await firebase.auth.signInWithEmailAndPassword(email,password);
                    console.log("Inside try ----after response")
                    if(response){
                        this.props.navigation.navigate('Transaction');
                    }
                }
                catch(error){
                    switch(error.code){
                        case 'auth/user-not-found':
                            Alert.alert("User doesn't exist");
                            console.log("user does not exist");
                        break;
                        case 'auth/invalid-email':
                            Alert.alert("Incorrect email or password");
                            console.log("Invalid")
                    }
                }
            }
            else{
                Alert.alert("Enter email and password");
            }
        }

    render(){
        return(
            <KeyboardAvoidingView style={{alignItems:"center", marginTop:20}}>
                <View>
                    <Image
                    source={require('../assets/booklogo.jpg')}
                    style={{width:200,height:200}}/>
                    <Text style={{textAlign:"center",fontSize:30}}>Wily</Text>
                </View>
                <View>
                    <TextInput
                    style={styles.loginBox}
                    placeholder="abc@example.com"
                    keyboardType='email-address'
                    onChangeText={(text)=>{
                        this.setState({
                            emailId:text
                        })
                    }}/>
                    <TextInput
                    style={styles.loginBox}
                    secureTextEntry={true}
                    placeholder="Enter password"
                    onChangeText={(text)=>{
                        this.setState({
                            password:text
                        })
                    }}/>
                </View>
                <View>
                    <TouchableOpacity style={styles.loginButton}
                    onPress={()=>{
                        this.login(this.state.emailId,this.state.password)
                    }}>
                        <Text style={{textAlign:"center"}}>Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}


const styles=StyleSheet.create({
    loginBox: {
        width:300,
        height:40,
        borderWidth:1.5,
        fontSize:20,
        margin:10,
        paddingLeft:10
    },
    loginButton: {
        height:30,
        width:90,
        borderWidth:1,
        marginTop:20,
        paddingTop:5,
        borderRadius:7
    }
})