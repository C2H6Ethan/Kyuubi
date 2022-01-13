import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { KeyboardAvoidingView ,TextInput, Pressable, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image, Keyboard, Alert } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Cube from 'cubejs';
import Scrambo from 'scrambo';
import Square from '../components/Square';
import AsyncStorage  from "@react-native-async-storage/async-storage";
import moment from 'moment';
import BannerAd from "../Ads/BannerAdHome";

import styled, { ThemeProvider } from 'styled-components/native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { switchTheme } from '../redux/actions'
import { darkTheme, lightTheme, defaultTheme, redTheme, avocadoTheme, cottonCandyTheme } from '../styles/theme'

import { MyContext } from "../context";

var scrambo = new Scrambo();
var cube = new Cube();
var faces = (cube.asString()).split('')

class HomeScreen extends Component{
    static contextType = MyContext;

    constructor (props){
        super(props);

        this.state = {
            scrambleText: '',
            timerText: '0.00',
            timeInSeconds: 0,
            timerStyle: {},
            timerPlus2Style: {},
            timerDNFStyle: {},
            hiddentTimerText: '0.00',
            timerColor: props.theme.PRIMARY_TEXT_COLOR,
            originalTimerColor: props.theme.PRIMARY_TEXT_COLOR,
            isTimerRunning: false,
            isTimerDisabled: false,
            isInspecting: false,
            isThereLastSolve: false,
            currentSolve: '-',
            mo3: '-',
            ao5: '-',
            ao12: '-',
            ao100: '-',

            bestSolve: '-',
            bestMo3: '-',
            bestAo5: '-',
            bestAo12: '-',
            bestAo100: '-',

            uFace: faces.slice(0, 9),
            rFace: faces.slice(9, 18),
            fFace: faces.slice(18, 27),
            dFace: faces.slice(27, 36),
            lFace: faces.slice(36, 45),
            bFace: faces.slice(45, 54),

            selectedSession: {name: '3x3', scramble: '3x3'},
            sessions: [],

            selectedSessionIndex: 0,

            selectedCube: '3x3',
            modalVisible: false,
            modalCubeType: null,

            selectedScramble: '3x3',
            scrambleTypes: ['2x2','3x3','4x4','5x5','6x6','7x7','Clock', 'Megaminx', 'Pyraminx', 'Skewb', 'Square-1'],
            scrambleCodes: ['222','333','444','555','666','777','clock', 'minx', 'pyram', 'skewb', 'sq1'],

        };

    }
    componentDidMount = async() =>{
        this.getTheme();

        this.checkSwitches();

        this.getSessions();

        this.getScramble();
    }

    getTheme = async () => {
        var theme = await AsyncStorage.getItem("theme");
        if(theme == null){
            theme = 'default'
        }

        switch(theme) {
            case 'dark':
                this.props.switchTheme(darkTheme);
                break;
            case 'light':
                this.props.switchTheme(lightTheme);
                break;
            case 'red':
                this.props.switchTheme(redTheme);
                break;
            case 'avocado':
                this.props.switchTheme(avocadoTheme);
                break;
            case 'cotton candy':
                this.props.switchTheme(cottonCandyTheme);
                break;
            default:
                this.props.switchTheme(defaultTheme);
        }
    }

    getScramble = async () => {
        var selectedScramble = this.state.selectedSession['scramble'];
        var index = this.state.scrambleTypes.findIndex(scrambleType => scrambleType === selectedScramble);
        var scrambleCode = this.state.scrambleCodes[index];
        var scramble = scrambo.type(scrambleCode).length(20).get(1);
        if(scrambleCode == '222'){scramble = scrambo.type(scrambleCode).length(9).get(1);}
        this.setState({scrambleText: scramble});

        if(scrambleCode == '333')
        {
            cube.identity();
            cube.move(scramble.toString());
            var faces = (cube.asString()).split('');

            this.setState({
                uFace: faces.slice(0, 9),
                rFace: faces.slice(9, 18),
                fFace: faces.slice(18, 27),
                dFace: faces.slice(27, 36),
                lFace: faces.slice(36, 45),
                bFace: faces.slice(45, 54),
            })
        }
        else{
            this.setState({
                uFace: [],
                rFace: [],
                fFace: [],
                dFace: [],
                lFace: [],
                bFace: [],
            })
        }
    }

    getSessions = async () => {
        var sessions = await AsyncStorage.getItem('sessions')
        if(sessions == null){
            var session = {name: '3x3', scramble: '3x3'};
            sessions = {sessions: [session]};
            await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
            var sessionArray = [session];
            this.setState({sessions: sessionArray});
        }
        else{
            sessions = JSON.parse(sessions);
            sessions = sessions['sessions'];
            this.setState({sessions: sessions});
        }
    }

    colorJSON = {
        'U': 'white',
        'R': 'red',
        'F': 'green',
        'D': 'yellow',
        'L': 'orange',
        'B': 'blue',
    }


    checkSwitches = async () => {
        var isTimerDisabledValue = await AsyncStorage.getItem("isTimerDisabled");
        if (isTimerDisabledValue == "true")
        {
            this.setState({isTimerDisabled: true});
        }
    }
    
    handleNewScramble = () => {
        this.getScramble();
    }
    
    handleTimerPressIn = async () => {
        if (this.state.isTimerRunning)
            {
            // finish timer
            clearTimeout(this.timerTimout);
            this.setState({isTimerRunning: false, timerText: this.state.hiddentTimerText, isThereLastSolve: true});


            // save solve
            this.setState({timerStyle: {},  timerPlus2Style: {}, timerDNFStyle: {}});
            var solveDate = moment().format('MMMM Do YYYY, h:mm:ss a');
            var solveScramble = this.state.scrambleText;
            var solveTime = this.state.hiddentTimerText;
            
            var solve = {time: solveTime, timeInSeconds:this.state.timeInSeconds, scramble: solveScramble, date: solveDate, mo3: '-', mo3InSeconds:0, ao5: '-', ao5InSeconds: 0, ao12: '-',ao12InSeconds: 0, ao100: '-',ao100InSeconds: 0, cubeType: this.state.selectedCube};
        
            var solves = await AsyncStorage.getItem("solves");
            if (solves == null) {
                var newSolves = {solves: [solve]};
                await AsyncStorage.setItem("solves", JSON.stringify(newSolves));
            }
            else {
                solves = JSON.parse(solves);
                solves = solves['solves'];
                solve = await this.context.calculateAverages(solve);
                solves.push(solve);
                var newSolves = {solves : solves};
                await AsyncStorage.setItem("solves", JSON.stringify(newSolves));
            }
            // refresh context solves
            this.context.getSolves();

            // display new averages
            this.context.displayAverages();
            // set new scramble
            this.getScramble();

            
            }
            else
            {
                var isTimerDisabled = await AsyncStorage.getItem('isTimerDisabled');
                if(isTimerDisabled == 'true')
                {
                    this.setState({isTimerDisabled: true})
                }
                else if(isTimerDisabled == 'false')
                {
                    this.setState({isTimerDisabled: false})
                }
                
                this.setState({timerStyle: { color: 'red'}});
                this.greenTimer = setTimeout(() => { this.setState({timerStyle: {color: 'lime'}}) }, 250);

            }
    }
    
    handleTimerPressOut = async () => {
        clearTimeout(this.greenTimer);
        this.setState({timerStyle:{}})
    
        if (this.state.timerStyle['color'] == 'lime'){
            //check if inspection timer is running
            if(this.state.isInspecting){
                this.setState({isTimerRunning: true, isInspecting: false})
                clearTimeout(this.timerTimout);
                this.startTime = new Date();
                this.handleStartTimer();
            }
            else{
                // check inspection setting
                if(this.context.inspection){
                    this.setState({isInspecting: true})

                    this.startTime = new Date();
                    this.handleInspectionTimer();
                }
                else {
                    // start timer
                    this.setState({isTimerRunning: true})
                    
                    this.startTime = new Date();
                    this.handleStartTimer();
                }
            }
        }
    }
    
    handleStartTimer = async () => {
        var now = new Date();
        var diff = now - this.startTime;
        
        var seconds = diff / 1000;
        var seconds = seconds.toFixed(2);

        var timeInSeconds = seconds;

        if(seconds > 60){seconds = this.secToMin(seconds)}

        var isTimerDisabled = this.state.isTimerDisabled;
        
        if(isTimerDisabled == false)
        {
            this.setState({timerText: seconds, hiddentTimerText: seconds, timeInSeconds: timeInSeconds})
        }
        else 
        {
            this.setState({hiddentTimerText: seconds, timerText: ':)', timeInSeconds: timeInSeconds})
        }
    
        this.timerTimout = setTimeout(() => { this.handleStartTimer(); }, 10);
    }

    handleInspectionTimer = async () => {
        var now = new Date();
        var diff = now - this.startTime;
        
        var seconds = diff / 1000;
        var seconds = seconds.toFixed(0);

        var seconds = 15 - seconds
        if(seconds > 0){
            this.setState({timerText: seconds})
            this.timerTimout = setTimeout(() => { this.handleInspectionTimer(); }, 1000);
        }
        else{
            this.setState({isTimerRunning: true, isInspecting: false})
            clearTimeout(this.timerTimout);
            this.startTime = new Date();
            this.handleStartTimer();
        }
    }

    secToMin = (seconds) =>{
        var result = '';
        if(seconds > 60){
            var minutes =  seconds / 60;
            var minutesOnly = Math.floor(minutes);
            var seconds = ((minutes % 1) * 60).toFixed(2);
            if(seconds < 10){result = `${minutesOnly}:0${seconds}`}
            else{result = `${minutesOnly}:${seconds}`}
        }
        else{
            result = seconds
        }
        
        return result;
    }

    setSelectedSession = async (itemValue, itemIndex) => {
        await AsyncStorage.setItem('selectedCube', itemValue);
        this.context.setSelectedCube(itemValue);
        this.context.getSolves();

        //find scramble type
        var scrambleType = null;
        this.state.sessions.forEach(session => {
            if(session['name'] == itemValue){scrambleType = session['scramble']};
        });
        var selectedSession = {name: itemValue, scramble: scrambleType};

        this.setState({selectedCube: itemValue, selectedSessionIndex: itemIndex, selectedSession: selectedSession, isThereLastSolve: false, timerText: '0.00'})

        this.context.displayAverages();
        this.getScramble();
    }

    setSelectedScramble = async (itemValue, itemIndex) => {
        this.setState({selectedScramble: itemValue})
    }

    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    }


    addCubeType = async () => {
        Keyboard.dismiss();
        this.setModalVisible(false)

        var textFromInput = this.state.modalCubeType;

        if(textFromInput == null){this.errorAlert("No session name was provided!")}
        else{
            //check if session already exists
            var sessions = this.state.sessions;
            var names = [];
            sessions.forEach(session => {
                names.push(session['name'])
            });
            if(names.includes(textFromInput))
            {
                //show error modal
                var errorText = 'A Session with this name already exists!'
                this.errorAlert(errorText);
                return
            }
            var session = {name: textFromInput, scramble: this.state.selectedScramble}
            sessions.push(session);
            sessions = {sessions: sessions}
            await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
            this.setState({modalCubeType: null});

            //set session to new session
            var index = sessions['sessions'].length - 1;
            this.setSelectedSession(textFromInput, index);
        }

        

    }

    deleteSession = async () => {
        var index = this.state.selectedSessionIndex;
        var sessions = this.state.sessions;
        var sessionToDelete = sessions[index];
        sessions.splice(index, 1);
        var moveToSession = sessions[0];
        this.setSelectedSession(moveToSession['name'], 0);

        var newSessions = {sessions: sessions}
        await AsyncStorage.setItem('sessions', JSON.stringify(newSessions));

        // delete solves
        var solves = await AsyncStorage.getItem('solves');
        if (solves != null){
            solves = JSON.parse(solves);
            solves = solves['solves'];

            //filter solves with cube type
            var filteredArray = []
            solves.forEach(solve => {
                if (solve['cubeType'] != sessionToDelete['name']){filteredArray.push(solve)}
            });

            var newSolves = {solves: filteredArray};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));
        }
    } 

    deleteLastSessionSolves = async () => {
        var index = this.state.selectedSessionIndex;
        var sessions = this.state.sessions;
        var sessionToDelete = sessions[index];

        // delete solves
        var solves = await AsyncStorage.getItem('solves');
        if (solves != null){
            solves = JSON.parse(solves);
            solves = solves['solves'];

            //filter solves with cube type
            var filteredArray = []
            solves.forEach(solve => {
                if (solve['cubeType'] != sessionToDelete['name']){filteredArray.push(solve)}
            });

            var newSolves = {solves: filteredArray};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));
        }

        this.setState({isThereLastSolve: false, timerText: '0.00'})
        this.context.getSolves();
        this.context.displayAverages();
    }

    deleteSessionAlert = () =>{
        var sessions = this.state.sessions;
        if (sessions.length > 1) {
            Alert.alert(
                "Session Deletion",
                "Are you sure you want to delete your session?",
                [
                    {
                    text: "No",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                    },
                    { text: "Yes", onPress: () => this.deleteSession() }
                ]
            );
        }
        else {
            Alert.alert(
                "Error",
                "You can't delete your last Session. Do you want to delete your Solves instead?",
                [
                    {
                    text: "No",
                    style: "cancel"
                    },
                    { text: "Yes", onPress: () => this.deleteLastSessionSolves() }
                ]
            );
        }
    }

    errorAlert = (errorText) =>{
        Alert.alert(
            "Error",
            errorText,
            [
                {
                text: "Okay",
                },
            ]
        );
    }

    deleteSolveAlert = () => {
        Alert.alert(
            "Solve Deletion",
            "Are you sure you want to delete your solve?",
            [
                {
                text: "No",
                style: "cancel"
                },
                { text: "Yes", onPress: () => this.deleteLastSolve() }
            ]
        );
    }
    
    deleteLastSolve = async () => {
        // delete solve
        var solves = await AsyncStorage.getItem('solves');
        solves = JSON.parse(solves);
        solves = solves['solves'];
        solves.reverse();
        solves.shift();
        solves.reverse();
        var newSolves = {solves: solves};
        await AsyncStorage.setItem('solves', JSON.stringify(newSolves));

        this.context.getSolves();
        this.context.displayAverages();

        this.setState({timerText: '0.00', isThereLastSolve: false})
    }

    addPlus2 = async () => {
        var solves = await AsyncStorage.getItem('solves');
        solves = JSON.parse(solves);
        solves = solves['solves'];
        solves.reverse();
        if(solves[0]['isPlus2'] == true){
            //remove 2
            solves[0]['isPlus2'] = false;
            solves[0]['alreadyAdded'] = true;
            solves[0] = await this.context.calculateAverages(solves[0]);
            solves.reverse();
            var newSolves = {solves: solves};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));

            this.context.getSolves();
            this.context.displayAverages();

            var newTimerText = ((Number(this.state.timerText) - 2).toFixed(2)).toString();
            this.setState({timerText: newTimerText, timerPlus2Style: {}})
        }
        else {
            //add 2 
            var solve = solves[0];
            solves[0]['isPlus2'] = true;
            solves[0]['isDNF'] = false;
            solves[0] = await this.context.calculateAverages(solves[0]);
            solves.reverse();
            var newSolves = {solves: solves};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));

            this.context.getSolves();
            this.context.displayAverages();

            var newTimerText = ((Number(solve['time']) + 2).toFixed(2)).toString();
            this.setState({timerText: newTimerText, timerPlus2Style: {backgroundColor: 'lime'}, timerDNFStyle: {}})
        }
    }

    addDNF = async () => {
        var solves = await AsyncStorage.getItem('solves');
        solves = JSON.parse(solves);
        solves = solves['solves'];
        solves.reverse();
        if(solves[0]['isDNF'] == true){
            //remove DNF
            var solve = solves[0];
            solves[0]['isDNF'] = false;
            solves[0]['alreadyAdded'] = true;
            solves[0] = await this.context.calculateAverages(solves[0]);
            solves.reverse();
            var newSolves = {solves: solves};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));

            this.context.getSolves();
            this.context.displayAverages();

            var newTimerText = solve['time'];
            this.setState({timerText: newTimerText, timerDNFStyle: {}})
        }
        else {
            //add DNF
            solves[0]['isDNF'] = true;
            solves[0]['isPlus2'] = false;
            solves[0] = await this.context.calculateAverages(solves[0]);
            solves.reverse();
            var newSolves = {solves: solves};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));

            this.context.getSolves();
            this.context.displayAverages();

            var newTimerText = 'DNF';
            this.setState({timerText: newTimerText, timerDNFStyle: {backgroundColor: 'lime'}, timerPlus2Style: {}})
        }
    }

    render(){
        const { navigate } = this.props.navigation;
        const { modalVisible } = this.state;

        let cubeTypes = this.state.sessions.map( (s, i) => {
            return <Picker.Item key={i} value={s['name']} label={s['name']} />
        });

        let scrambleCodes = this.state.scrambleCodes.map( (s, i) => {
            return <Picker.Item key={i} value={this.state.scrambleTypes[i]} label={this.state.scrambleTypes[i]} />
        });

        return (
            <MyContext.Consumer>
                {context => (
                    <ThemeProvider theme={this.props.theme}>
                        {this.state.isTimerRunning == false && this.state.isInspecting == false? 
                        <Container>
                                <View>
                                    {context.showAds == true && context.isPro == false? <BannerAd/> : null}
                                </View>
                                <Modal
                                    animationType="slide"
                                    transparent={true}
                                    visible={modalVisible}
                                    onRequestClose={() => {
                                        this.setModalVisible(!modalVisible);
                                    }}
                                    >
                                    <TouchableOpacity activeOpacity={1} onPress={() => this.setModalVisible(!modalVisible)} style={{flex: 1,justifyContent: 'center',alignItems: 'center'}}>
                                    <TouchableOpacity activeOpacity={1} style={{width: '60%', height: '40%'}}>
                                    <KeyboardAvoidingView
                                        style={styles.centeredView}
                                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                                    >
                                        <ModalView>
                                            <ModalTextInput
                                                placeholder="session name"
                                                placeholderTextColor="lightgray" 
                                                onChangeText={ text => this.setState({modalCubeType: text})}
                                            />
                                            <ScrambleSelector
                                            itemStyle={{height: 100}}
                                                selectedValue={this.state.selectedScramble}
                                                onValueChange={(itemValue, itemIndex) => this.setSelectedScramble(itemValue, itemIndex)}
            
                                            >
                                                {scrambleCodes}
                                            </ScrambleSelector>
                                            <ModalButton
                                                onPress={() => this.addCubeType()}
                                            >
                                                <TextStyle>Add</TextStyle>
                                            </ModalButton>
                                        </ModalView>
                                    </KeyboardAvoidingView>
                                    </TouchableOpacity>
                                    </TouchableOpacity>
                                </Modal>
            
            
                                <View style={styles.cubeSelectionContainer}>
                                    <AddCubeTypeButton activeOpacity={1}onPress={() => this.deleteSessionAlert()}>
                                        <Text>x</Text>
                                    </AddCubeTypeButton>
            
                                    <Selector
                                    itemStyle={{height: 44}}
                                        selectedValue={this.state.selectedCube}
                                        onValueChange={(itemValue, itemIndex) => this.setSelectedSession(itemValue, itemIndex)}
            
                                    >
                                        {cubeTypes}
                                    </Selector>
            
                                    <AddCubeTypeButton activeOpacity={1} onPress={() => this.setModalVisible(true)}>
                                        <Text>+</Text>
                                    </AddCubeTypeButton>
                                </View>
                                
            
                                <TouchableOpacity activeOpacity={1} style={styles.scramble} onPress={this.handleNewScramble}>
                                    <SrambleText>{this.state.scrambleText}</SrambleText>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={1} style={styles.timer} onPressIn={this.handleTimerPressIn} onPressOut={this.handleTimerPressOut}>
                                    <TimerText style={this.state.timerStyle}>{this.state.timerText}</TimerText>
                                    {this.state.isThereLastSolve?
                                        <View style={styles.timerButtons}>
                                            <TimerButton activeOpacity={1} onPressIn={this.deleteSolveAlert}><TimerButtonText>X</TimerButtonText></TimerButton>
                                            <TimerButton activeOpacity={1} onPressIn={this.addPlus2} style={this.state.timerPlus2Style}><TimerButtonText>+2</TimerButtonText></TimerButton>
                                            <TimerButton activeOpacity={1} onPressIn={this.addDNF} style={this.state.timerDNFStyle}><TimerButtonText>DNF</TimerButtonText></TimerButton>
                                        </View>
                                        : null
                                    }
                                </TouchableOpacity>
                                <StatusBar style="auto" />
            
                                <View style={styles.averages}>
                                    <View>
                                        <AveragesText>current: {context.currentSolve}</AveragesText>
                                        <AveragesText>mo3: {context.mo3}</AveragesText>
                                        <AveragesText>ao5: {context.ao5}</AveragesText>
                                        <AveragesText>ao12: {context.ao12}</AveragesText>
                                        <AveragesText>ao100: {context.ao100}</AveragesText>
                                    </View>
            
            
                                    <View style={styles.scrambleImage}>
                                        <View style={styles.faces}>
                                        {
                                            this.state.uFace.map((item, index) =>{
                                            return (
                                                <Square color={this.colorJSON[item]}/>
                                            )
                                            })
                                        }
                                        </View>
                                        <View style={styles.middleFaces}>
                                        
                                            <View style={styles.faces}>
                                            {
                                                this.state.lFace.map((item, index) =>{
                                                return (
                                                    <Square color={this.colorJSON[item]}/>
                                                )
                                                })
                                            }
                                            </View>
                                            <View style={styles.faces}>
                                            {
                                                this.state.fFace.map((item, index) =>{
                                                return (
                                                    <Square color={this.colorJSON[item]}/>
                                                )
                                                })
                                            }
                                            </View>
                                            <View style={styles.faces}>
                                            {
                                                this.state.rFace.map((item, index) =>{
                                                return (
                                                    <Square color={this.colorJSON[item]}/>
                                                )
                                                })
                                            }
                                            </View>
                                            <View style={styles.faces}>
                                            {
                                                this.state.bFace.map((item, index) =>{
                                                return (
                                                    <Square color={this.colorJSON[item]}/>
                                                )
                                                })
                                            }
                                            </View>
                                        </View>
                                        <View style={styles.faces}>
                                        {
                                            this.state.dFace.map((item, index) =>{
                                            return (
                                                <Square color={this.colorJSON[item]}/>
                                            )
                                            })
                                        }
                                        </View>
                                    </View>
            
            
                                    <View>
                                        <AveragesText>best: {context.bestSolve}</AveragesText>
                                        <AveragesText>mo3: {context.bestMo3}</AveragesText>
                                        <AveragesText>ao5: {context.bestAo5}</AveragesText>
                                        <AveragesText>ao12: {context.bestAo12}</AveragesText>
                                        <AveragesText>ao100: {context.bestAo100}</AveragesText>
                                    </View>
                                </View>
            
                                <PageNavigator>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SettingsScreen')}>
                                        <Image style={styles.pagesButton} source={require('../assets/settings.png')}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Image style={styles.pagesButtonClicked} source={require('../assets/home.png')}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SolvesScreen')}>
                                    <Image style={styles.pagesButton} source={require('../assets/graph.png')}/>
                                    </TouchableOpacity>
                                </PageNavigator>
                            </Container> 
                            : 
                            <Container>
                                <TouchableOpacity activeOpacity={1} style={styles.timer} onPressIn={this.handleTimerPressIn} onPressOut={this.handleTimerPressOut}>
                                    <TimerText style={this.state.timerStyle}>{this.state.timerText}</TimerText>
                                </TouchableOpacity>
                                <StatusBar style="auto" />
                            </Container>}
                            
                </ThemeProvider>
                )}
            
            </MyContext.Consumer>
            
            )
    }
}

const mapStateToProps = state => ({
    theme: state.themeReducer.theme
  })
  
const mapDispatchToProps = dispatch => ({
switchTheme: bindActionCreators(switchTheme, dispatch)
})

export default connect(
mapStateToProps,
mapDispatchToProps
)(HomeScreen)

const styles = StyleSheet.create({
    scramble: {
        padding: 15,
    },
    timer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        bottom: '18%',
        marginTop: '30%',
    },
    timerButtons:{
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    averages: {
        justifyContent: 'space-evenly',
        alignItems: 'center',
        bottom: '20%',
        flexDirection: 'row',
        width: '100%',
        
    },
    pagesButton: {
        width: 25,
        height: 25,
    },
    pagesButtonClicked: {
        width: 35,
        height: 35,
    },
    faces: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 36,
        margin: 0.5,
        right: 18,
    },
    middleFaces: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        left: 18,
    },
    scrambleImage: {
        alignItems: 'center',
        justifyContent: "center",
    },
    cubeSelectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
});

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.PRIMARY_BACKGROUND_COLOR};
  justify-content: center;
  align-items: center;
`

const PageNavigator = styled.View`
    position: absolute;
    bottom: 3%;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding-vertical: 15px;
    padding-horizontal: 15px;
    border-radius: 60px;
    width: 60%;
    backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
`
const ScrambleSelector = styled.Picker`
    backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    borderRadius: 10px;
    minWidth: 70%;
    height: 40%;
`
const Selector = styled.Picker`
backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    borderRadius: 10px;
    width: 70%;
`

const TextStyle = styled.Text`
    color: ${props => props.theme.SECONDARY_TEXT_COLOR};
    fontWeight: bold;
    textAlign: center;
`

const ModalTextInput = styled.TextInput`
    textAlign: center;
    paddingVertical: 15px;
    paddingHorizontal: 15px;
    backgroundColor: ${props => props.theme.PRIMARY_BACKGROUND_COLOR};
    borderRadius: 60px;
    borderColor: ${props => props.theme.PRIMARY_TEXT_COLOR};
    borderWidth: 1px;
    minWidth: 50%;
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
`

const ModalButton = styled.Pressable`
    backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    borderRadius: 20px;
    padding: 10px;
    elevation: 2;
`

const ModalView = styled.View`
    flex: 1;
    backgroundColor: ${props => props.theme.PRIMARY_BACKGROUND_COLOR};
    borderRadius: 20px;
    padding: 35px;
    alignItems: center;
    justifyContent: space-around;
    shadowColor: #000;
    shadowOpacity: 0.25;
    shadowRadius: 4px;
    elevation: 5;
`
const AddCubeTypeButton = styled.TouchableOpacity`
    backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    align-items: center;
    justify-content: center;
    height: 30px;
    width: 30px;
    border-radius: 30px;
    margin: 8px;
`

const SrambleText = styled.Text`
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    fontSize: 20px;
    textAlign: center;
`
const AveragesText = styled.Text`
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    font-size: 10px;
`
const TimerText = styled.Text`
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    fontSize: 75px;
`
const TimerButton = styled.TouchableOpacity`
    align-items: center;
    justify-content: center;
    background-color: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    width: 50px;
    padding: 10px;
    borderRadius: 30px;
    margin: 5px;
`

const TimerButtonText = styled.Text`
    color: ${props => props.theme.SECONDARY_TEXT_COLOR};
    fontSize: 10px;
`