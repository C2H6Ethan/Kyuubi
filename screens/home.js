import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import { KeyboardAvoidingView ,TextInput, Pressable, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image, Keyboard } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Cube from 'cubejs';
import Scrambo from 'scrambo';
import Square from '../components/Square';
import AsyncStorage  from "@react-native-async-storage/async-storage";
import moment from 'moment';

var scrambo = new Scrambo();
var cube = new Cube();
var scramble = scrambo.get(1);
cube.move(scramble.toString());
var faces = (cube.asString()).split('')


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

            uFace: faces.slice(0, 9),
            rFace: faces.slice(9, 18),
            fFace: faces.slice(18, 27),
            dFace: faces.slice(27, 36),
            lFace: faces.slice(36, 45),
            bFace: faces.slice(45, 54),

            selectedCube: '3x3',
            selectedCubeIndex: 0,
            cubeTypes: ['3x3'],
            modalVisible: false,
            deleteModalVisible: false,
            modalCubeType: null,

            selectedScramble: '3x3',
            scrambleTypes: ['2x2','3x3','4x4','5x5','7x7','Clock', 'Megaminx', 'Pyraminx', 'Skewb', 'Square-1'],

        };

    }
    componentDidMount = async() =>{
        this.checkSwitches();

        this.displayAverages();

        this.getCubeTypes();
        
    }

    getCubeTypes = async () => {
        var cubeTypes = await AsyncStorage.getItem('cubeTypes')
        if(cubeTypes == null){
            cubeTypes = ['3x3'];
            await AsyncStorage.setItem('cubeTypes', cubeTypes.toString());
        }
        else{
            cubeTypes = cubeTypes.split(',');
            this.setState({cubeTypes: cubeTypes});
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
                times.push(Number(element['time']));
                means.push(Number(element['time']));
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
    
    handleNewScramble = () => {
        if (!this.state.isTimerRunning){
            newScramble = scrambo.get(1);
            cube.identity();
            cube.move(newScramble[0].toString());
            var faces = (cube.asString()).split('');
            this.setState({scrambleText: newScramble[0], uFace: faces.slice(0, 9), rFace: faces.slice(9, 18), fFace: faces.slice(18, 27), dFace: faces.slice(27, 36), lFace: faces.slice(36, 45), bFace: faces.slice(45, 54),});
        }
    }
    
    handleTimerPressIn = async () => {
        // await AsyncStorage.clear();
        if (this.state.isTimerRunning)
        {
        // finish timer
        clearTimeout(this.timerTimout);
        this.setState({isTimerRunning: false, timerText: this.state.hiddentTimerText});

        // save solve
        var solveDate = moment().format('MMMM Do YYYY, h:mm:ss a');
        var solveScramble = this.state.scrambleText;
        var solveTime = this.state.hiddentTimerText;
        var solve = {time: solveTime, scramble: solveScramble, date: solveDate, mean: '-', ao5: '-', ao12: '-', ao100: '-', cubeType: this.state.selectedCube};
       
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
        var newScramble = scrambo.get(1);
        cube.identity();
        cube.move(newScramble.toString());
        var faces = (cube.asString()).split('')
        this.setState({scrambleText: newScramble, uFace: faces.slice(0, 9), rFace: faces.slice(9, 18), fFace: faces.slice(18, 27), dFace: faces.slice(27, 36), lFace: faces.slice(36, 45), bFace: faces.slice(45, 54),});


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

    setSelectedCube = async (itemValue, itemIndex) => {
        this.setState({selectedCube: itemValue, selectedCubeIndex: itemIndex})
        await AsyncStorage.setItem('selectedCube', itemValue);

        this.displayAverages();
    }

    setSelectedScramble = async (itemValue, itemIndex) => {
        this.setState({selectedScramble: itemValue})
    }

    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    }

    setDeleteModalVisible = (visible) => {
        if (this.state.cubeTypes.length > 1){
            this.setState({ deleteModalVisible: visible });
        }
    }

    addCubeType = async () => {
        Keyboard.dismiss();
        this.setModalVisible(false)

        var textFromInput = this.state.modalCubeType;
        var cubeTypes = this.state.cubeTypes;
        cubeTypes.push(textFromInput);
        await AsyncStorage.setItem('cubeTypes', cubeTypes.toString());

    }

    deleteCubeType = async () => {
        this.setDeleteModalVisible(false);
        var index = this.state.selectedCubeIndex;
        var cubeTypes = this.state.cubeTypes;
        var typeToDelete = cubeTypes[index];
        cubeTypes.splice(index, 1);
        var moveToType = cubeTypes[0];
        this.setSelectedCube(moveToType, 0);

        // delete solves
        var solves = await AsyncStorage.getItem('solves');
        if (solves != null){
            solves = JSON.parse(solves);
            solves = solves['solves'];

            //filter solves with cube type
            var filteredArray = []
            solves.forEach(solve => {
                if (solve['cubeType'] != typeToDelete){filteredArray.push(solve)}
            });

            var newSolves = {solves: filteredArray};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));
            await this.displayAverages();
        }
    }    

    render(){
        const { navigate } = this.props.navigation;
        const { modalVisible } = this.state;
        const { deleteModalVisible } = this.state;

        let cubeTypes = this.state.cubeTypes.map( (s, i) => {
            return <Picker.Item key={i} value={s} label={s} />
        });

        let scrambleTypes = this.state.scrambleTypes.map( (s, i) => {
            return <Picker.Item key={i} value={s} label={s} />
        });

        return (
            <SafeAreaView style={styles.container}>


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        this.setModalVisible(!modalVisible);
                    }}
                    >
                    <TouchableOpacity activeOpacity={1} onPress={() => this.setModalVisible(!modalVisible)} style={{flex: 1,justifyContent: 'center',alignItems: 'center'}}>
                    <TouchableOpacity activeOpacity={1} style={{width: '80%', height: '30%'}}>
                    <KeyboardAvoidingView
                        style={styles.centeredView}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                    >
                        <View style={styles.modalView}>
                            <TextInput
                                style={styles.modalTextInput}
                                placeholder="new session"
                                placeholderTextColor="lightgray" 
                                onChangeText={ text => this.setState({modalCubeType: text})}
                            />
                            <Picker
                            itemStyle={{height: 44}}
                                selectedValue={this.state.selectedScramble}
                                style={styles.scrambleSelector}
                                onValueChange={(itemValue, itemIndex) => this.setSelectedScramble(itemValue, itemIndex)}

                            >
                                {scrambleTypes}
                            </Picker>
                            <Pressable
                                style={styles.modalButton}
                                onPress={() => this.addCubeType()}
                            >
                                <Text style={styles.textStyle}>Add</Text>
                            </Pressable>
                        </View>
                    </KeyboardAvoidingView>
                    </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={deleteModalVisible}
                    onRequestClose={() => {
                        this.setDeleteModalVisible(!deleteModalVisible);
                    }}
                    >
                    <TouchableOpacity activeOpacity={1} onPress={() => this.setDeleteModalVisible(!deleteModalVisible)} style={{flex: 1,justifyContent: 'center',alignItems: 'center'}}>
                    <TouchableOpacity activeOpacity={1} style={{width: '80%', height: '20%'}}>
                        <View style={styles.modalView}>
                            <Text>Are you sure you want to delete your {this.state.selectedCube} session and delete all its solves?</Text>
                            <Pressable
                                style={styles.modalButton}
                                onPress={() => this.deleteCubeType()}
                            >
                                <Text style={styles.textStyle}>Yes</Text>
                            </Pressable>
                        </View>
                    </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>


                <View style={styles.cubeSelectionContainer}>
                    <TouchableOpacity activeOpacity={1} style={styles.addCubeTypeButton} onPress={() => this.setDeleteModalVisible(true)}>
                        <Text>x</Text>
                    </TouchableOpacity>

                    <Picker
                    itemStyle={{height: 44}}
                        selectedValue={this.state.selectedCube}
                        style={styles.selector}
                        onValueChange={(itemValue, itemIndex) => this.setSelectedCube(itemValue, itemIndex)}

                    >
                        {cubeTypes}
                    </Picker>

                    <TouchableOpacity activeOpacity={1} style={styles.addCubeTypeButton} onPress={() => this.setModalVisible(true)}>
                        <Text>+</Text>
                    </TouchableOpacity>
                </View>
                

                <TouchableOpacity activeOpacity={1} style={styles.scramble} onPress={this.handleNewScramble}>
                    <Text style={styles.scrambleText}>{this.state.scrambleText}</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} style={styles.timer} onPressIn={this.handleTimerPressIn} onPressOut={this.handleTimerPressOut}>
                    <Text style={{ color: this.state.timerColor, fontSize: 50, bottom: '25%'}}>{this.state.timerText}</Text>
                </TouchableOpacity>
                <StatusBar style="auto" />

                <View style={styles.averages}>
                    <View>
                        <Text style={styles.averagesText}>current: {this.state.currentSolve}</Text>
                        <Text style={styles.averagesText}>mean: {this.state.mean}</Text>
                        <Text style={styles.averagesText}>ao5: {this.state.ao5}</Text>
                        <Text style={styles.averagesText}>ao12: {this.state.ao12}</Text>
                        <Text style={styles.averagesText}>ao100: {this.state.ao100}</Text>
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
                        <Text style={styles.averagesText}>best: {this.state.bestSolve}</Text>
                        <Text style={styles.averagesText}>mean: {this.state.bestMean}</Text>
                        <Text style={styles.averagesText}>ao5: {this.state.bestAo5}</Text>
                        <Text style={styles.averagesText}>ao12: {this.state.bestAo12}</Text>
                        <Text style={styles.averagesText}>ao100: {this.state.bestAo100}</Text>
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
        padding: 15,
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
        justifyContent: 'space-evenly',
        alignItems: 'center',
        bottom: 90,
        flexDirection: 'row',
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
    pagesButtonClicked: {
        width: 35,
        height: 35,
    },
    averagesText: {
        fontSize: 10,
    },
    faces: {
        flexDirection: 'row',
        flexWrap: 1,
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
    selector: {
        backgroundColor: 'dodgerblue',
        borderRadius: 10,
        width: '70%'
    },
    scrambleSelector: {
        backgroundColor: 'dodgerblue',
        borderRadius: 10,
        width: 200,
    },
    cubeSelectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addCubeTypeButton: {
        backgroundColor: 'dodgerblue',
        alignItems: 'center',
        justifyContent: 'center',
        height: 30,
        width: 30,
        borderRadius: 30,
        margin: 8
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    modalView: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalButton: {
        backgroundColor: 'dodgerblue',
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    modalTextInput: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: 'white',
        borderRadius: 60,
        borderColor: '#C0C0C0',
        borderWidth: 1,
        minWidth: '50%',
        },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
});