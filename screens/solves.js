import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import {Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image, Switch, TargetComponent, Alert, ScrollView } from 'react-native';
import  AsyncStorage  from "@react-native-async-storage/async-storage";
import moment from 'moment';
import {Picker} from '@react-native-picker/picker';
import BannerAd from "../Ads/BannerAdSolves";
import { useFocusEffect } from '@react-navigation/native';

import styled, { ThemeProvider } from 'styled-components/native'
import { connect } from 'react-redux'
import { bindActionCreators, combineReducers } from 'redux'
import { switchTheme } from '../redux/actions'

import { MyContext } from "../context";
import { createNavigationContainer } from 'react-navigation';
import { initialize } from 'scrambo/lib/scramblers/clock';

class SolvesScreen extends Component{
    static contextType = MyContext;

    constructor(props){
        super(props);

        this.state = {
            solves: [],
            modalVisible: false,
            modalTime: null,
            modalDate: null,
            modalScramble: null,
            currentSolveIndex: null,
            selectedValue: 'date',

            primaryColor: '#303030',
            accentColor: '#007fff',

            timerPlus2Style: {},
            timerDNFStyle: {},

            solvesCount: 0,
        };
    }


    setModalVisible = async (visible, index) => {
        this.setState({ modalVisible: visible });

        if (visible)
        {
            // set solve data
           var solves = this.context.solves;
           var solve = solves[index];
           var solveTime = solve['time']
           if(solve['isPlus2'] == true)
            {
               solveTime = (Number(solveTime) + 2).toFixed(2);
               this.setState({ timerPlus2Style: {backgroundColor: 'lime'}});
            }
           else
            {
                if(solve['isDNF'] == true)
                {
                    solveTime = 'DNF';
                    this.setState({ timerDNFStyle: {backgroundColor: 'lime'}});
                }
            }
           this.setState({modalTime: solveTime, modalDate: solve['date'], modalScramble: solve['scramble'],  modalCubeType: solve['cubeType'],currentSolveIndex: index,});
        }
        else
        {
            this.setState({timerPlus2Style: {} ,timerDNFStyle: {}});
        }
    }
    componentDidMount = async () => {
        var filterItem = await AsyncStorage.getItem('filterItem');


        if (filterItem != null){
            this.setState({selectedValue: filterItem});
            this.setSelectedValue(filterItem);
        }
        
    }

    deleteSolve = async (index) => {
        let itemsCopy = this.context.solves;
        var solveToDelete = itemsCopy[index];
        itemsCopy.splice(index, 1);


        // change solves counter
        var solvesCount = this.context.solvesCount;
        solvesCount -= 1;

        this.context.setSolves(itemsCopy);
        this.context.setSolvesCount(solvesCount);

        var solves = await AsyncStorage.getItem('solves');
        solves = JSON.parse(solves);
        solves = solves['solves'];

        var indexToDelete = null;

        var BreakException = {};
        try{
            solves.forEach((solve, i) => {
                if(solve['timeInSeconds'] == solveToDelete['timeInSeconds'] && solve['date'] == solveToDelete['date'])
                {
                    indexToDelete = i;
                    throw BreakException;
                }
            });
        }
        catch (e) {
            if (e !== BreakException) throw e;
        }

        solves.splice(indexToDelete, 1);

        var solvesToSave = {solves: solves};
        await AsyncStorage.setItem('solves', JSON.stringify(solvesToSave));
        this.context.getSolves();
        this.recalculate(indexToDelete);

        this.setModalVisible(false, null);
    }

    lapsList() {
        if(this.context.solves.length > 0){
            return this.context.solves.map((data, index) => {
                return (
                    <Times key={index} onPress={() => this.setModalVisible(true, index)}>
                        {data.isDNF? <TimeText>DNF</TimeText>:null}
                        {data.isPlus2? <TimeText>{(Number(data.time) + 2).toFixed(2)}</TimeText> : null}
                        {data.isPlus2 != true && data.isDNF != true? <TimeText>{data.time}</TimeText>: null}
                    </Times>
                )
              })
        }
    }

    setSelectedValue = async (itemValue) => {
        this.setState({selectedValue: itemValue})
        await AsyncStorage.setItem('filterItem', itemValue);

        if (itemValue == 'time')
        {
            var filteredArray = this.context.solves.sort((a, b) => parseFloat(a.timeInSeconds) - parseFloat(b.timeInSeconds))
            
            this.context.setSolves(filteredArray);
        }
        else if (itemValue == 'date')
        {
            var solves = await AsyncStorage.getItem('solves');
            if (solves != null){
                solves = JSON.parse(solves);
                solves = solves['solves'];

                //filter solves with cube type
                var cubeType = await AsyncStorage.getItem('selectedCube');
                var filteredArray = []

                solves.forEach(solve => {
                    if (solve['cubeType'] == cubeType){filteredArray.push(solve)}
                });

                filteredArray.reverse();
                this.context.setSolves(filteredArray);
            }
        }
    }

    addPlus2 = async (index) => {
        let itemsCopy = this.context.solves;
        var solveToChange = itemsCopy[index];

        var solves = await AsyncStorage.getItem('solves');
        solves = JSON.parse(solves);
        solves = solves['solves'];

        var indexToChange = null;

        var BreakException = {};
        try{
            solves.forEach((solve, i) => {
                // if the solve doesn't match to solveToDelete add it to the new Array
                if(solve['timeInSeconds'] == solveToChange['timeInSeconds'] && solve['date'] == solveToChange['date'])
                {
                    indexToChange = i;
                    throw BreakException;
                }
            });
        }
        catch (e) {
            if (e !== BreakException) throw e;
        }

        if(solveToChange['isPlus2'] == true){
            //remove 2

            solves[indexToChange]['isPlus2'] = false;

            var newSolves = {solves: solves};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));

            this.context.getSolves();

            var newModalTime = solves[indexToChange]['time'];

            this.setState({timerPlus2Style: {}, modalTime: newModalTime})
            this.recalculate(indexToChange);
        }
        else {
            //add 2

            solves[indexToChange]['isPlus2'] = true;
            solves[indexToChange]['isDNF'] = false;

            var newSolves = {solves: solves};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));

            this.context.getSolves();

            var newModalTime = (Number(solves[indexToChange]['time']) + 2).toFixed(2);

            this.setState({timerPlus2Style: {backgroundColor: 'lime'}, timerDNFStyle: {}, modalTime: newModalTime})
            this.recalculate(indexToChange);
        }
    }

    

    addDNF = async (index) => {
        let itemsCopy = this.context.solves;
        var solveToChange = itemsCopy[index];

        var solves = await AsyncStorage.getItem('solves');
        solves = JSON.parse(solves);
        solves = solves['solves'];

        var indexToChange = null;

        var BreakException = {};
        try{
            solves.forEach((solve, i) => {
                // if the solve doesn't match to solveToDelete add it to the new Array
                if(solve['timeInSeconds'] == solveToChange['timeInSeconds'] && solve['date'] == solveToChange['date'])
                {
                    indexToChange = i;
                    throw BreakException;
                }
            });
        }
        catch (e) {
            if (e !== BreakException) throw e;
        }

        if(solveToChange['isDNF'] == true){
            //remove DNF

            solves[indexToChange]['isDNF'] = false;

            var newSolves = {solves: solves};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));

            this.context.getSolves();

            var newModalTime = solves[indexToChange]['time'];

            this.setState({timerDNFStyle: {}, modalTime: newModalTime})
            this.recalculate(indexToChange);
        }
        else {
            //add DNF
            
            solves[indexToChange]['isDNF'] = true;
            solves[indexToChange]['isPlus2'] = false;

            var newSolves = {solves: solves};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));

            this.context.getSolves();

            var newModalTime = 'DNF';

            this.setState({timerDNFStyle: {backgroundColor: 'lime'}, timerPlus2Style: {}, modalTime: newModalTime})
            this.recalculate(indexToChange);
        }
    }

    recalculate = async (InitialIndex) =>{
        var solves = await AsyncStorage.getItem("solves");
        solves = JSON.parse(solves);
        solves = solves['solves'];
        //check if newest solve got deleted
        if(InitialIndex != solves.length){
            //remove solves with same cube type
            var solvesWithoutCubeType = [];
            var solvesWithCubeType = [];
            solves.forEach(element => {
                if(element['cubeType'] != solves[InitialIndex]['cubeType']){solvesWithoutCubeType.push(element)}
                else{solvesWithCubeType.push(element)}
            });

            var solveToChangeIndex = solvesWithCubeType.findIndex(x => x == solves[InitialIndex]);

            solves = solvesWithCubeType;

            for (solveToChangeIndex; solveToChangeIndex < solvesWithCubeType.length; solveToChangeIndex++) {
                var solvesBefore = [];
                for (var solvesBeforeIndex = 0; solvesBeforeIndex < solveToChangeIndex; solvesBeforeIndex++) {
                    solvesBefore.push(solves[solvesBeforeIndex])
                }
                solvesBefore.reverse();
                
                if(solvesBefore.length >= 2)
                {
                    //calculate mo3
                    var sum = 0;
                    var values = [];
                    var isDNF = false;
                    for (var i = 0; i < 2; i++){
                        var currentSolve = solvesBefore[i];
                        sum = sum + parseFloat(currentSolve['timeInSeconds']);
                        if(currentSolve['isPlus2'] == true){sum = sum + 2}
                        else{if(currentSolve['isDNF'] == true){isDNF = true}}
                    }
                    sum = sum + parseFloat(solves[solveToChangeIndex]['timeInSeconds']);
                    if(solves[solveToChangeIndex]['isPlus2'] == true){sum = sum + 2}
                    else{if(solves[solveToChangeIndex]['isDNF'] == true){isDNF = true}}
                    var mo3 = sum / 3;
                    mo3 = Number(mo3).toFixed(2);
                    solves[solveToChangeIndex]['mo3InSeconds'] = mo3;
                    if(mo3 > 60){mo3 = this.secToMin(mo3)};

                    if(isDNF){
                        solves[solveToChangeIndex]['mo3'] = 'DNF'
                    }
                    else{
                        solves[solveToChangeIndex]['mo3'] = mo3;
                    }

                    if (solvesBefore.length >= 4)
                    {
                        //calculate ao5
                        var sum = 0;
                        var values = [];
                        var isDNF = false;
                        var DNFCounter = 0;
                        for (var i = solveToChangeIndex - 4; i < solveToChangeIndex; i++){
                            var currentSolve = solvesBefore[i];
                            if(currentSolve['isPlus2'] == true){values.push(2)}
                            else{
                                if(currentSolve['isDNF']  == true){
                                    DNFCounter = DNFCounter + 1; if(DNFCounter >= 2){isDNF = true}
                                }
                                else{
                                    values.push(parseFloat(currentSolve['timeInSeconds']));
                                }
                            }
                        }
                        values.push(solves[solveToChangeIndex]['isPlus2']? parseFloat(solves[solveToChangeIndex]['timeInSeconds']) + 2 : parseFloat(solves[solveToChangeIndex]['timeInSeconds']));
                        if(solves[solveToChangeIndex]['isDNF']){DNFCounter = DNFCounter + 1; if(DNFCounter >= 2){isDNF = true}}

                        var max = Math.max(...values);
                        var min = Math.min(...values);

                        values.forEach(element =>{
                            sum = sum + element;
                        });
                        if(DNFCounter == 1){sum = sum - min;}
                        else{sum = sum - max - min;}
                        
                        var ao5 = sum / 3;
                        ao5 = ao5.toFixed(2);
                        solves[solveToChangeIndex]['ao5InSeconds'] = ao5;
                        if(ao5>60){ao5 = this.secToMin(ao5)}

                        if(isDNF){
                            solves[solveToChangeIndex]['ao5'] = 'DNF'
                        }
                        else{
                            solves[solveToChangeIndex]['ao5'] = ao5;
                        }

                        if(solvesBefore.length >= 11)
                        {
                            //calculate ao12
                            var sum = 0;
                            var values = [];
                            var isDNF = false;
                            var DNFCounter = 0;
                            for (var i = solveToChangeIndex - 11; i < solveToChangeIndex; i++){
                                var currentSolve = solvesBefore[i];
                                if(currentSolve['isPlus2'] == true){values.push(2)}
                                else{if(currentSolve['isDNF'] == true){DNFCounter = DNFCounter + 1; if(DNFCounter >= 2){isDNF = true}}else{values.push(parseFloat(currentSolve['timeInSeconds']));}}
                                
                            }
                            values.push(solves[solveToChangeIndex]['isPlus2']? parseFloat(solves[solveToChangeIndex]['timeInSeconds']) + 2 : parseFloat(solves[solveToChangeIndex]['timeInSeconds']));
                            if(solves[solveToChangeIndex]['isDNF']){DNFCounter = DNFCounter + 1; if(DNFCounter >= 2){isDNF = true}}

                            var max = Math.max(...values);
                            var min = Math.min(...values);

                            values.forEach(element =>{
                                sum = sum + element;
                            });
                            if(DNFCounter == 1){sum = sum - min;}
                            else{sum = sum - max - min;}

                            var ao12 = sum / 10;
                            ao12 = ao12.toFixed(2);
                            solves[solveToChangeIndex]['ao12InSeconds'] = ao12;
                            if(ao12>60){ao12 = this.secToMin(ao12)}
                            
                            if(isDNF){
                                solves[solveToChangeIndex]['ao12'] = 'DNF'
                            }
                            else{
                                solves[solveToChangeIndex]['ao12'] = ao12;
                            }

                            if(solvesBefore.length >= 99)
                            {
                                //calculate ao100
                                var sum = 0;
                                var values = [];
                                var isDNF = false;
                                var DNFCounter = 0;
                                for (var i = solveToChangeIndex - 99; i < solveToChangeIndex; i++){
                                    var currentSolve = solvesBefore[i];
                                    if(currentSolve['isPlus2'] == true){values.push(2)}
                                    else{if(currentSolve['isDNF'] == true){DNFCounter = DNFCounter + 1; if(DNFCounter >= 6){isDNF = true}}else{values.push(parseFloat(currentSolve['timeInSeconds']));}}
                                }
                                values.push(solves[solveToChangeIndex]['isPlus2']? parseFloat(solves[solveToChangeIndex]['timeInSeconds']) + 2 : parseFloat(solves[solveToChangeIndex]['timeInSeconds']));
                                if(solves[solveToChangeIndex]['isDNF']){DNFCounter = DNFCounter + 1; if(DNFCounter >= 6){isDNF = true}}

                                values.sort(function(a, b) {
                                    return a - b;
                                });
                                values.splice(0,5);
                                values.reverse();
                                values.splice(0,(5 - DNFCounter));

                                values.forEach(element =>{
                                    sum = sum + element;
                                });

                                var ao100 = sum / 90;
                                ao100 = ao100.toFixed(2);
                                solves[solveToChangeIndex]['ao100InSeconds'] = ao100;
                                if(ao100>60){ao100 = this.secToMin(ao100)}
                                
                                if(isDNF){
                                    solves[solveToChangeIndex]['ao100'] = 'DNF'
                                }
                                else{
                                    solves[solveToChangeIndex]['ao100'] = ao100;
                                }
                            }
                        }
                    }
                }
                else{
                    solves[solveToChangeIndex]['mo3'] = '-';
                    solves[solveToChangeIndex]['ao5'] = '-';
                    solves[solveToChangeIndex]['ao12'] = '-';
                    solves[solveToChangeIndex]['ao100'] = '-';
                }
                
            }

            solves = solves.concat(solvesWithoutCubeType);

            var newSolves = {solves: solves};
            await AsyncStorage.setItem('solves', JSON.stringify(newSolves));

            this.context.getSolves();
        }
        this.context.displayAverages();
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
                { text: "Yes", onPress: () => this.deleteSolve(this.state.currentSolveIndex) }
            ]
        );
    }


    render(){
        const { navigate } = this.props.navigation;
        const { modalVisible } = this.state;
        return (
            <MyContext.Consumer>
                {context => (
                    <ThemeProvider theme={this.props.theme}>
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
                        <TouchableOpacity activeOpacity={1} style={{width: 375, height: 250}}>
                        <View style={styles.centeredView}>
                            <ModalView>
                            <ModalScrambleText>{this.state.modalTime}</ModalScrambleText>
                            <ModalText>{this.state.modalCubeType}</ModalText>
                            <ModalText>{this.state.modalScramble}</ModalText>
                            <ModalText>{this.state.modalDate}</ModalText>
                            <View style={styles.timerButtons}>
                                <TimerButton activeOpacity={1} onPressIn={this.deleteSolveAlert}><TimerButtonText>X</TimerButtonText></TimerButton>
                                <TimerButton activeOpacity={1} onPressIn={() => this.addPlus2(this.state.currentSolveIndex)} style={this.state.timerPlus2Style}><TimerButtonText>+2</TimerButtonText></TimerButton>
                                <TimerButton activeOpacity={1} onPressIn={() => this.addDNF(this.state.currentSolveIndex)} style={this.state.timerDNFStyle}><TimerButtonText>DNF</TimerButtonText></TimerButton>
                            </View>
                            </ModalView>
                        </View>
                        </TouchableOpacity>
                        </TouchableOpacity>
                        </Modal>
    
                                <Filter
                                itemStyle={{height: 44}}
                                    selectedValue={this.state.selectedValue}
                                    onValueChange={(itemValue, itemIndex) => this.setSelectedValue(itemValue)}
                                >
                                    <Picker.Item label="Date" value="date" />
                                    <Picker.Item label="Time" value="time" />
                                </Filter>
    
                                <View>
                                    <SolvesCount>{context.solvesCount} Solves</SolvesCount>
                                </View>
    
                                <ScrollView>
                                    <View style={styles.timesContainer}>
                                        {this.lapsList()}
                                    </View>
                                </ScrollView>
                                
                                <PageNavigator>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('SettingsScreen')}>
                                        <Image style={styles.pagesButton} source={require('../assets/settings.png')}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.props.navigation.navigate('HomeScreen')}>
                                        <Image style={styles.pagesButton} source={require('../assets/home.png')}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                    <Image style={styles.pagesButtonClicked} source={require('../assets/graph.png')}/>
                                    </TouchableOpacity>
                                </PageNavigator>
                            </Container>
                </ThemeProvider>
                )}
            </MyContext.Consumer>
        )
    }
}

const styles = StyleSheet.create({
    pagesButton: {
        width: 25,
        height: 25,
    },
    timesContainer: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingBottom: 80,
    },
    pagesButtonClicked: {
        width: 35,
        height: 35,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalButtonsContainer: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    filter: {
        backgroundColor: '#007fff',
        borderRadius: 10,
        marginBottom: 8,
        width: '80%',
    },
    timerButtons:{
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
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

const Times = styled.TouchableOpacity`
    align-items: center;
    justify-content: center;
    background-color: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    width: 80px;
    padding: 10px;
    borderRadius: 60px;
    margin: 10px;
`

const SolvesCount = styled.Text`
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
`
const TimeText = styled.Text`
    color: ${props => props.theme.SECONDARY_TEXT_COLOR};
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

const ButtonClose = styled.Pressable`
    backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    borderRadius: 20px;
    padding: 10px;
    elevation: 2;
`

const TextStyle = styled.Text`
    color: ${props => props.theme.SECONDARY_TEXT_COLOR};
    fontWeight: bold;
    textAlign: center;
`
const ModalText = styled.Text`
    color: ${props => props.theme.PRIMARY_TEXT_COLOR};
    text-align: center;
    margin-bottom: 15px;

`
const ModalScrambleText = styled.Text`
    color: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    margin-bottom: 15px;
    text-align: center;
    font-size: 35px;
`

const Filter = styled.Picker`
    backgroundColor: ${props => props.theme.SECONDARY_BACKGROUND_COLOR};
    borderRadius: 10px;
    marginBottom: 8px;
    width: 80%;
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

const mapStateToProps = state => ({
    theme: state.themeReducer.theme
  })
  
  const mapDispatchToProps = dispatch => ({
    switchTheme: bindActionCreators(switchTheme, dispatch)
  })
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(SolvesScreen)