import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image } from 'react-native';
import Scrambo from 'scrambo';
import AsyncStorage  from "@react-native-async-storage/async-storage";

var scrambo = new Scrambo();
var scramble = scrambo.get(1);


export default class HomeScreen extends Component{

    constructor (props){
        super(props);

        this.state = {
            scrambleText: scramble,
            timerText: '0.00',
            hiddentTimerText: '0.00',
            timerColor : 'black',
            isTimerRunning: false,
            isTimerDisabled: false,
        };

    }
    componentDidMount = async() =>{
        this.checkSwitches();
    }

    checkSwitches = async () => {
        var isTimerDisabledValue = await AsyncStorage.getItem("isTimerDisabled");
        if (isTimerDisabledValue == "true")
        {
            this.setState({isTimerDisabled: true});
        }
    }

    returnData = async (key) => {
        try {
            const value = await AsyncStorage.getItem(key);
            return value;
        } 
        catch (error) {
            console.warn(error);
        }
    }
    
    handleNewScramble = () => {
        newScramble = scrambo.get(1);
        this.setState({
        scrambleText: newScramble[0]
        })
    }
    
    handleTimerPressIn = async () => {
        if (this.state.isTimerRunning)
        {
        // finish timer
        clearTimeout(this.timerTimout);
        this.setState({isTimerRunning: false, timerText: this.state.hiddentTimerText});

        // set new scramble
        var newScramble = scrambo.get(1);
        this.setState({scrambleText: newScramble});
    
        }
        else
        {
            if(this.props.navigation.getParam('isTimerDisabled'))
            {
                this.setState({isTimerDisabled: true})
            }
            else 
            {
                this.setState({isTimerDisabled: false})
            }
            
            this.setState({ timerColor: 'red'});
            this.greenTimer = setTimeout(() => { this.setState({timerColor: 'lime'}) }, 250);
        }
    
        
    }
    
    handleTimerPressOut = async () => {
        clearTimeout(this.greenTimer);
        this.setState({
        timerColor: 'black'
        })
    
        if (this.state.timerColor == 'lime'){
        // start timer
        this.setState({isTimerRunning: true})
        

        this.startTime = new Date();
        this.handleStartTimer();
        }
    }
    
    handleStartTimer = async () => {
        var now = new Date();
        var diff = now - this.startTime;
        
        var seconds = diff / 1000;
        var seconds = seconds.toFixed(2);

        var isTimerDisabled = this.state.isTimerDisabled;
        
        if(isTimerDisabled == false)
        {
            this.setState({timerText: seconds, hiddentTimerText: seconds})
        }
        else 
        {
            this.setState({hiddentTimerText: seconds, timerText: ':)'})
        }
    
        this.timerTimout = setTimeout(() => { this.handleStartTimer(); }, 10);
    }

    render(){
        const { navigate } = this.props.navigation;
        return (
            <SafeAreaView style={styles.container}>
                <TouchableOpacity activeOpacity={1} style={styles.scramble} onPress={this.handleNewScramble}>
                    <Text style={styles.scrambleText}>{this.state.scrambleText}</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} style={styles.timer} onPressIn={this.handleTimerPressIn} onPressOut={this.handleTimerPressOut}>
                    <Text style={{ color: this.state.timerColor, fontSize: 50, bottom: '25%'}}>{this.state.timerText}</Text>
                </TouchableOpacity>
                <StatusBar style="auto" />
                <View style={styles.pageNavigator}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SettingsScreen')}>
                        <Image style={styles.pagesButton} source={require('../assets/settings.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image style={styles.pagesButton} source={require('../assets/home.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity>
                    <Image style={styles.pagesButton} source={require('../assets/graph.png')}/>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'gray',
        alignItems: 'center',
    },
    scramble: {
        backgroundColor: 'dodgerblue',
        padding: 15,
        borderRadius: 10,
        margin: 8,
    },
    scrambleText: {
    },
    timer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    pageNavigator: {
        position: 'absolute',
        bottom: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 60,
        width: 250,
        backgroundColor: 'dodgerblue' 
    },
    pagesButton: {
        width: 25,
        height: 25,
    },
});