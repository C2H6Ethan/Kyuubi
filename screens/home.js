import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image } from 'react-native';
import Scrambo from 'scrambo';
import AsyncStorage  from "@react-native-async-storage/async-storage";
import moment from 'moment';

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
        };

    }
    componentDidMount = async() =>{
        this.checkSwitches();

        this.displayAverages();
        
    }

    displayAverages = async () => {
        
        //get averages
        var solves = await AsyncStorage.getItem("solves");
        solves = JSON.parse(solves);
        solves = solves['solves'];

        if (solves.length > 0){
            solves.reverse();
            lastSolve = solves[0];
            this.setState({currentSolve: lastSolve['time'], mean: lastSolve['mean'], ao5: lastSolve['ao5'], ao12: lastSolve['ao12'], ao100: lastSolve['ao100']})
        }

        //get best averages
        var times = [];
        var means = [];
        var ao5s = [];
        var ao12s = [];
        var ao100s = [];

        solves.forEach(element => {
            times.push(Number(element['time']));
            means.push(Number(element['mean']));
            if (solves.length >= 5)
            {
               if (! isNaN(element['ao5'])){
                    ao5s.push(Number(element['ao5']));
                } 

                this.setState({bestAo5: Math.min(...ao5s)})
            }
            
            if (solves.length >= 12)
            {
               if (! isNaN(element['ao12'])){
                    ao12s.push(Number(element['ao12']));
                } 

                this.setState({bestAo12: Math.min(...ao12s)})
            }

            if (solves.length >= 100)
            {
                if (! isNaN(element['ao100'])){
                    ao100s.push(Number(element['ao100']));
                }

                this.setState({bestAo100: Math.min(...ao100s)})
            }
            
            
        });

        this.setState({bestSolve: Math.min(...times), bestMean: Math.min(...means)})
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
        solves.reverse();

        if(solves.length > 0)
        {
            //calculate mean
            var sum = 0;
            solves.forEach(element => {
                sum = sum + parseFloat(element['time']);
            });
            sum = sum + parseFloat(solve['time']);
            var mean = sum / (solves.length + 1);
            mean = Number(mean).toFixed(2);
            solve['mean'] = mean;
            this.setState({mean: mean})
        }
        else {
            solve['mean'] = solve['time'];
            this.setState({mean: Number(solve['time']).toFixed(2)})
        }

        if (solves.length >= 4)
        {
            //calculate ao5
            var sum = 0;
            var values = [];
            for (var i = 0; i < 4; i++){
                var currentSolve = solves[i];
                values.push(parseFloat(currentSolve['time']));
            }
            values.push(parseFloat(solve['time']));
            

            var max = Math.max(...values);
            var min = Math.min(...values);

            values.forEach(element =>{
                sum = sum + element;
            });
            sum = sum - max - min;

            var ao5 = sum / 3;
            ao5 = Number((ao5).toFixed(2));
            this.setState({ao5: Number((ao5).toFixed(2))})
            solve['ao5'] = ao5;

            if(solves.length >= 11)
            {
                //calculate ao12
                var sum = 0;
                var values = [];
                for (var i = 0; i < 11; i++){
                    var currentSolve = solves[i];
                    values.push(parseFloat(currentSolve['time']));
                }
                values.push(parseFloat(solve['time']));

                var max = Math.max(...values);
                var min = Math.min(...values);

                values.forEach(element =>{
                    sum = sum + element;
                });
                sum = sum - max - min;

                var ao12 = sum / 10;
                ao12 = Number((ao12).toFixed(2));
                this.setState({ao12: Number((ao12).toFixed(2))})
                solve['ao12'] = ao12;

                if(solves.length >= 99)
                {
                    //calculate ao100
                    var sum = 0;
                    var values = [];
                    for (var i = 0; i < 99; i++){
                        var currentSolve = solves[i];
                        values.push(parseFloat(currentSolve['time']));
                    }
                    values.push(parseFloat(solve['time']));

                    var max = Math.max(...values);
                    var min = Math.min(...values);

                    values.forEach(element =>{
                        sum = sum + element;
                    });
                    sum = sum - max - min;

                    var ao100 = sum / 98;
                    ao100 = Number((ao100).toFixed(2));
                    this.setState({ao100:Number((ao100).toFixed(2))})
                    solve['ao100'] = ao100;
                }
            }
        }

        return solve;
    }

    storeData = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, value);
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

        // save solve
        var solveDate = moment().format('MMMM Do YYYY, h:mm:ss a');
        var solveScramble = this.state.scrambleText;
        var solveTime = this.state.hiddentTimerText;
        var solve = {time: solveTime, scramble: solveScramble, date: solveDate, mean: '-', ao5: '-', ao12: '-', ao100: '-'};
       
        var solves = await AsyncStorage.getItem("solves");
        if (solves == null ) {
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
        var newScramble = scrambo.get(1);
        this.setState({scrambleText: newScramble});

        }
        else
        {
            if(this.props.navigation.getParam('isTimerDisabled'))
            {
                this.setState({isTimerDisabled: true})
            }
            else if(this.props.navigation.getParam('isTimerDisabled') == false)
            {
                this.setState({isTimerDisabled: false})
            }
            
            this.setState({ timerColor: 'red'});
            this.greenTimer = setTimeout(() => { this.setState({timerColor: 'lime'}) }, 250);

            //await AsyncStorage.removeItem('solves');
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

                <View style={styles.averages}>
                    <View style={styles.currentAverages}>
                        <Text>current: {this.state.currentSolve}</Text>
                        <Text>mean: {this.state.mean}</Text>
                        <Text>ao5: {this.state.ao5}</Text>
                        <Text>ao12: {this.state.ao12}</Text>
                        <Text>ao100: {this.state.ao100}</Text>
                    </View>
                    <View style={styles.bestAverages}>
                        <Text>best: {this.state.bestSolve}</Text>
                        <Text>mean: {this.state.bestMean}</Text>
                        <Text>ao5: {this.state.bestAo5}</Text>
                        <Text>ao12: {this.state.bestAo12}</Text>
                        <Text>ao100: {this.state.bestAo100}</Text>
                    </View>
                    
                </View>

                <View style={styles.pageNavigator}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SettingsScreen')}>
                        <Image style={styles.pagesButton} source={require('../assets/settings.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Image style={styles.pagesButtonClicked} source={require('../assets/home.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SolvesScreen')}>
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
    averages: {
        justifyContent: 'space-around',
        alignItems: 'center',
        bottom: 90,
        flexDirection: 'row',
        width: 250,
        
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
    navigatorUnderline: {
        height: 2,
        width: 25,
        backgroundColor: 'white',
    },
    pagesButton: {
        width: 25,
        height: 25,
    },
    pagesButtonClicked: {
        width: 35,
        height: 35,
    },
});