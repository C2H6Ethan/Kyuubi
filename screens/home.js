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

var scrambo = new Scrambo();
var cube = new Cube();
var faces = (cube.asString()).split('')

class HomeScreen extends Component{

    constructor (props){
        super(props);

        this.state = {
            scrambleText: '',
            timerText: '0.00',
            timeInSeconds: 0,
            timerStyle: {},
            hiddentTimerText: '0.00',
            timerColor: props.theme.PRIMARY_TEXT_COLOR,
            originalTimerColor: props.theme.PRIMARY_TEXT_COLOR,
            isTimerRunning: false,
            isTimerDisabled: false,
            currentSolve: '-',
            mean: '-',
            ao5: '-',
            ao12: '-',
            ao100: '-',

            bestSolve: '-',
            bestMean: '-',
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

        this.displayAverages();

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
        var scramble = scrambo.type(scrambleCode).get(1);
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

    displayAverages = async () => {
        
        //get averages
        var solves = await AsyncStorage.getItem("solves");
        if (solves != null)
        {
        solves = JSON.parse(solves);
        solves = solves['solves'];

        //filter solves with cube type
        var filteredArray = []
        solves.forEach(solve => {
            if (solve['cubeType'] == this.state.selectedCube){filteredArray.push(solve)}
        });
        solves = filteredArray;

        if (solves.length > 0){
            solves.reverse();
            lastSolve = solves[0];
            this.setState({currentSolve: lastSolve['time'], mean: lastSolve['mean'], ao5: lastSolve['ao5'], ao12: lastSolve['ao12'], ao100: lastSolve['ao100']})
        

            //get best averages
            var times = [];
            var means = [];
            var ao5s = [];
            var ao12s = [];
            var ao100s = [];

            var minAo5 = '-';
            var minAo12 = '-';
            var minAo100 = '-';

            solves.forEach(element => {
                times.push(Number(element['timeInSeconds']));
                means.push(Number(element['timeInSeconds']));
                if (solves.length >= 5)
                {
                if (! isNaN(element['ao5'])){
                        ao5s.push(Number(element['ao5']));
                    } 

                    minAo5 =  Math.min(...ao5s);
                }
                
                if (solves.length >= 12)
                {
                if (! isNaN(element['ao12'])){
                        ao12s.push(Number(element['ao12']));
                    } 

                    minAo12 = Math.min(...ao12s);
                }

                if (solves.length >= 100)
                {
                    if (! isNaN(element['ao100'])){
                        ao100s.push(Number(element['ao100']));
                    }

                    minAo100 = Math.min(...ao100s);
                }
                
                
            });

            this.setState({bestSolve: Math.min(...times), bestMean: Math.min(...means), bestAo5: minAo5, bestAo12: minAo12, bestAo100: minAo100})
        }
        else{this.setState({currentSolve: '-', mean: '-', ao5: '-', ao12: '-', ao100: '-', bestSolve: '-', bestMean: '-', bestAo5: '-', bestAo12: '-', bestAo100: '-'})}
        }
    }

    checkSwitches = async () => {
        var isTimerDisabledValue = await AsyncStorage.getItem("isTimerDisabled");
        if (isTimerDisabledValue == "true")
        {
            this.setState({isTimerDisabled: true});
        }
    }

    calculateAverages = async (solve) => {                       
        var solves = await AsyncStorage.getItem("solves");
        solves = JSON.parse(solves);
        solves = solves['solves'];

        //filter solves with cube type
        var filteredArray = []
        solves.forEach(solve => {                                       
            if (solve['cubeType'] == this.state.selectedCube){filteredArray.push(solve)}
        });
        solves = filteredArray;

        solves.reverse();

        if(solves.length > 0)
        {
            //calculate mean
            var sum = 0;
            solves.forEach(element => {
                sum = sum + parseFloat(element['timeInSeconds']);
            });
            sum = sum + parseFloat(solve['timeInSeconds']);
            var mean = sum / (solves.length + 1);
            mean = Number(mean).toFixed(2);
            if(mean > 60){mean = this.secToMin(mean)}
            solve['mean'] = mean;
            this.setState({mean: mean})
        }
        else {
            solve['mean'] = solve['timeInSeconds'];
            var mean = Number(solve['timeInSeconds']).toFixed(2);
            if(mean > 60){mean = this.secToMin(mean)}
            this.setState({mean: mean})
        }

        if (solves.length >= 4)
        {
            //calculate ao5
            var sum = 0;
            var values = [];
            for (var i = 0; i < 4; i++){
                var currentSolve = solves[i];
                values.push(parseFloat(currentSolve['timeInSeconds']));
            }
            values.push(parseFloat(solve['timeInSeconds']));
            

            var max = Math.max(...values);
            var min = Math.min(...values);

            values.forEach(element =>{
                sum = sum + element;
            });
            sum = sum - max - min;

            var ao5 = sum / 3;
            ao5 = ao5.toFixed(2);
            if(ao5>60){ao5 = this.secToMin(ao5)}
            this.setState({ao5: ao5})
            solve['ao5'] = ao5;

            if(solves.length >= 11)
            {
                //calculate ao12
                var sum = 0;
                var values = [];
                for (var i = 0; i < 11; i++){
                    var currentSolve = solves[i];
                    values.push(parseFloat(currentSolve['timeInSeconds']));
                }
                values.push(parseFloat(solve['timeInSeconds']));

                var max = Math.max(...values);
                var min = Math.min(...values);

                values.forEach(element =>{
                    sum = sum + element;
                });
                sum = sum - max - min;

                var ao12 = sum / 10;
                ao12 = ao12.toFixed(2);
                if(ao12>60){ao12 = this.secToMin(ao12)}
                this.setState({ao12: ao12})
                solve['ao12'] = ao12;

                if(solves.length >= 99)
                {
                    //calculate ao100
                    var sum = 0;
                    var values = [];
                    for (var i = 0; i < 99; i++){
                        var currentSolve = solves[i];
                        values.push(parseFloat(currentSolve['timeInSeconds']));
                    }
                    values.push(parseFloat(solve['timeInSeconds']));

                    var max = Math.max(...values);
                    var min = Math.min(...values);

                    values.forEach(element =>{
                        sum = sum + element;
                    });
                    sum = sum - max - min;

                    var ao100 = sum / 98;
                    ao100 = ao100.toFixed(2);
                    if(ao100>60){ao100 = this.secToMin(ao100)}
                    this.setState({ao100:ao100})
                    solve['ao100'] = ao100;
                }
            }
        }

        return solve;
    }
    
    handleNewScramble = () => {
        this.getScramble();
    }
    
    handleTimerPressIn = async () => {
        if (this.state.isTimerRunning)
        {
        // finish timer
        clearTimeout(this.timerTimout);
        this.setState({isTimerRunning: false, timerText: this.state.hiddentTimerText});

        // save solve
        var solveDate = moment().format('MMMM Do YYYY, h:mm:ss a');
        var solveScramble = this.state.scrambleText;
        var solveTime = this.state.hiddentTimerText;
        
        var solve = {time: solveTime, timeInSeconds:this.state.timeInSeconds, scramble: solveScramble, date: solveDate, mean: '-', ao5: '-', ao12: '-', ao100: '-', cubeType: this.state.selectedCube};
       
        var solves = await AsyncStorage.getItem("solves");
        if (solves == null ) {
            solve['mean'] = solve['time'];
            var newSolves = {solves: [solve]};
            await AsyncStorage.setItem("solves", JSON.stringify(newSolves));
        }
        else {
            solves = JSON.parse(solves);
            solves = solves['solves'];
            solve = await this.calculateAverages(solve);
            solves.push(solve);
            var newSolves = {solves : solves};
            await AsyncStorage.setItem("solves", JSON.stringify(newSolves));
        }

        // display new averages
        this.displayAverages();
        // set new scramble
        this.getScramble();

        this.setState({timerStyle: {}});
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

        //find scramble type
        var scrambleType = null;
        this.state.sessions.forEach(session => {
            if(session['name'] == itemValue){scrambleType = session['scramble']};
        });
        var selectedSession = {name: itemValue, scramble: scrambleType};

        this.setState({selectedCube: itemValue, selectedSessionIndex: itemIndex, selectedSession: selectedSession})

        this.displayAverages();
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
            await this.displayAverages();
        }
    } 

    deleteSessionAlert = () =>{
        var sessions = this.state.sessions;
        if (sessions.length > 1) {
            Alert.alert(
                "Session Deletion",
                "Are you sure you want to delete your session",
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
            this.errorAlert("You must have at least 1 session");
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
            <ThemeProvider theme={this.props.theme}>
                <Container>
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
                    </TouchableOpacity>
                    <StatusBar style="auto" />

                    <View style={styles.averages}>
                        <View>
                            <AveragesText>current: {this.state.currentSolve}</AveragesText>
                            <AveragesText>mean: {this.state.mean}</AveragesText>
                            <AveragesText>ao5: {this.state.ao5}</AveragesText>
                            <AveragesText>ao12: {this.state.ao12}</AveragesText>
                            <AveragesText>ao100: {this.state.ao100}</AveragesText>
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
                            <AveragesText>best: {this.state.bestSolve}</AveragesText>
                            <AveragesText>mean: {this.state.bestMean}</AveragesText>
                            <AveragesText>ao5: {this.state.bestAo5}</AveragesText>
                            <AveragesText>ao12: {this.state.bestAo12}</AveragesText>
                            <AveragesText>ao100: {this.state.bestAo100}</AveragesText>
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
            </ThemeProvider>
            
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
    },
    averages: {
        justifyContent: 'space-evenly',
        alignItems: 'center',
        bottom: 90,
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
    bottom: 50px;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    padding-vertical: 15px;
    padding-horizontal: 15px;
    border-radius: 60px;
    width: 250px;
    backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
`
const ScrambleSelector = styled.Picker`
    backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    borderRadius: 10px;
    width: 150px;
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
`
const AveragesText = styled.Text`
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    font-size: 10px;
`
const TimerText = styled.Text`
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    fontSize: 50px;
    bottom: 25%;
`