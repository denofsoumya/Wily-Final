import React from 'react';
import {Text,View,TouchableOpacity,StyleSheet,Image, Alert,KeyboardAvoidingView ,ToastAndroid} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import * as firebase from 'firebase'
import db from '../config.js'

export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state= {
            hasCameraPermissions: null,
            scanned : false,
            scannedData : '',
            scannedBookId: '',
            scannedStudentId: '',
            buttonState:'normal',
            transactionMessage:''
        }
    }

    getCameraPermissions=async(id)=>{
        const {status}= await Permissions.askAsync(Permissions.CAMERA);

        this.setState({
            hasCameraPermissions:status==="granted",
            buttonState:id,
            scanned:false
        })
    }

    handleBarCodeScanned=async({type,data})=>{
        //console.log(this.state)
        const {buttonState}=this.state;
        //console.log(buttonState)
        if(buttonState==="BookId"){
        this.setState({
            scanned:true,
            scannedBookId:data,
            buttonState:'normal'
        })
    }
    else if(buttonState==="StudentId"){
        this.setState({
            scanned:true,
            scannedStudentId:data,
            buttonState:'normal'
        })
    }
    }

    handleTransaction=async()=>{
        var transactionType=await this.checkBookEligibility();
        //console.log("Transaction Type",transactionType);
        if(!transactionType){
            Alert.alert("The book doesn't exist in the library database");
            this.setState({
                scannedBookId:'',
                scannedStudentId:''
            })
        }

        else if(transactionType==="Issue"){
            var isStudentEligible=await this.checkStudentEligibilityForBookIssue();
            if(isStudentEligible){
                this.initiateBookIssue();
                Alert.alert("Book Issued to the student");
            }
        }

        else{
            var isStudentEligible=await this.checkStudentEligibilityForReturn();
            if(isStudentEligible){
                this.initiateBookReturn();
                Alert.alert("Book returned to the library");
            }
        }

    }

    checkStudentEligibilityForBookIssue=async()=>{
        console.log("Student Id:"+this.state.scannedStudentId);
        const studentRef=await db.collection("students").where("studentId","==",this.state.scannedStudentId).get();
        var isStudentEligible=""
        console.log(studentRef.docs);
        if(studentRef.docs.length==0){
            this.setState({
                scannedBookId:'',
                scannedStudentId:''
            })
            isStudentEligible=false;
            Alert.alert("The student id doesn't exist in the database")
        }
        else{
            studentRef.docs.map((doc)=>{
                var student=doc.data();
                if(student.numberOfBooksIssued<2){
                    isStudentEligible=true;
                }
                else{
                    isStudentEligible=false;
                    Alert.alert("The student has already issued 2 books");
                    this.setState({
                        scannedStudentId:'',
                        scannedBookId:''
                    })
                }
            })
        }
        return isStudentEligible;
    }

    checkStudentEligibilityForReturn=async()=>{
        const transactionRef=await db.collection("transactions").where("bookId","==",this.state.scannedBookId).limit(1).get()
        var isStudentEligible=""
        transactionRef.docs.map((doc)=>{
            var lastBookTransaction=doc.data();
            if(lastBookTransaction.studentId===this.state.scannedStudentId){
                isStudentEligible=true;
            }
            else{
                isStudentEligible=false;
                Alert.alert("The book wasn't issued by the student");
                this.setState({
                    scannedBookId:'',
                    scannedStudentId:''
                })
            }
        })
        return isStudentEligible;
    }

    checkBookEligibility=async()=>{
        const bookRef=await db.collection("books").where("bookId","==",this.state.scannedBookId).get();
        var transactionType="";
      //console.log(bookRef.docs);
        if(bookRef.docs.length==0){
            transactionType=false;
           
        }
        else{
            bookRef.docs.map((doc)=>{
                var book=doc.data();
                //console.log(book);
                if(book.bookAvailability){
                    transactionType="Issue"
                }
                else{
                    transactionType="Return"
                }
            })
        }
        return transactionType;
    }

    initiateBookIssue=async()=>{
        //add a transaction
        db.collection("transactions").add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':"Issue"
        })
        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability':false
        })
        //change number of issued books for student
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
        //Alert.alert("Book Issued!");
        this.setState({
            scannedBookId:'',
            scannedStudentId:''
        })
    }

    initiateBookReturn=async()=>{
        //add a transaction
        db.collection("transactions").add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':"Return"
        })
        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
            'bookAvailability':true
        })
        //change number of issued books for student
        db.collection("students").doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
        //Alert.alert("Book Returned!");
        this.setState({
            scannedBookId:'',
            scannedStudentId:''
        })
    }


    render(){
        const hasCameraPermissions=this.state.hasCameraPermissions;
        const scanned=this.state.scanned;
        const buttonState=this.state.buttonState;
        if(buttonState!== "normal" && hasCameraPermissions){
            return(
                <BarCodeScanner 
                onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}/>
            )
        }
        else if(buttonState==='normal'){
        return(
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <View>
                    <Image
                    source={require('../assets/booklogo.jpg')}
                    style={{width:200,height:200}}/>
                    <Text style={{textAlign:"center",fontSize:30}}>Wily</Text>
                </View>
                <View style={styles.inputView}>
                    <TextInput
                    style={styles.inputBox}
                    placeholder="Book Id"
                    onChangeText={text =>this.setState({scannedBookId:text})}
                    value={this.state.scannedBookId}/>
                    <TouchableOpacity style={styles.scanButton}
                    onPress={()=>{
                        this.getCameraPermissions("BookId");
                    }}>
                        <Text style={styles.buttonText}>Scan</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputView}>
                    <TextInput
                    style={styles.inputBox}
                    placeholder="Student Id"
                    onChangeText ={text => this.setState({scannedStudentId:text})}
                    value={this.state.scannedStudentId}/>
                    <TouchableOpacity style={styles.scanButton}
                    onPress={()=>{
                        this.getCameraPermissions("StudentId");
                    }}>
                        <Text style={styles.buttonText}>Scan</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.submitButton} 
                onPress={ async()=>{
                    var transactionMessage=this.handleTransaction();
               
                }}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        );
        }
    }
}


const styles=StyleSheet.create({
    container: {
        flex:1,
        justifyContent:"center",
        alignItems:"center"
    },
    displayText: {
        fontSize:15,
        textDecorationLine:"underline"
    },
    scanButton: {
        backgroundColor:"#2196F3",
        padding:10,
        height:40
    },
    buttonText: {
        fontSize:20
    },
    inputView: {
        flexDirection:"row",
        margin:20
    },
    inputBox: {
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    submitButton:{
        backgroundColor:"#FBC02D",
        width:100,
        height:50
    },
    submitButtonText: {
        padding:10,
        textAlign:"center",
        fontSize:20,
        fontWeight:"bold",
        color:"white"
    }
})