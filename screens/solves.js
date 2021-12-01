import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import {Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, Image, Switch, TargetComponent } from 'react-native';
import  AsyncStorage  from "@react-native-async-storage/async-storage";
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import moment from 'moment';
import {Picker} from '@react-native-picker/picker';
import BannerAd from "../Ads/BannerAdSettings";
import { useFocusEffect } from '@react-navigation/native';

import styled, { ThemeProvider } from 'styled-components/native'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { switchTheme } from '../redux/actions'

class SolvesScreen extends Component{
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

            solvesCount: 0,
        };
    }


    setModalVisible = async (visible, index) => {
        this.setState({ modalVisible: visible });

        if (visible)
        {
            // set solve data
           var solves = this.state.solves;
           var solve = solves[index];
           this.setState({modalTime: solve['time'], modalDate: solve['date'], modalScramble: solve['scramble'],  modalCubeType: solve['cubeType'],currentSolveIndex: index,});
    
        }
    }
    componentDidMount = async () => {

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

            var solvesCount = filteredArray.length;

            filteredArray.reverse();
            this.setState({solves: filteredArray, solvesCount: solvesCount});
        }
        var filterItem = await AsyncStorage.getItem('filterItem');


        if (filterItem != null){
            this.setState({selectedValue: filterItem});
            this.setSelectedValue(filterItem);
        }
        
    }

    deleteSolve = async (index) => {
        let itemsCopy = this.state.solves;
        var solveToDelete = itemsCopy[index];
        itemsCopy.splice(index, 1);


        // change solves counter
        var solvesCount = this.state.solvesCount;
        solvesCount -= 1;

        this.setState({solves: itemsCopy, solvesCount: solvesCount});

        var solves = await AsyncStorage.getItem('solves');
        solves = JSON.parse(solves);
        solves = solves['solves'];

        var newSolves = []
        solves.forEach(solve => {
            // if the solve doesn't match to solveToDelete add it to the new Array
            if(!(solve['time'] == solveToDelete['time'] && solve['date'] == solveToDelete['date']))
            {
                newSolves.push(solve);
            }
        });

        var solvesToSave = {solves: newSolves};
        await AsyncStorage.setItem('solves', JSON.stringify(solvesToSave));

        this.setModalVisible(false, null);
    }

    lapsList() {

        if(this.state.solves.length > 0){
            return this.state.solves.map((data, index) => {
                return (
                    <Times key={index} onPress={() => this.setModalVisible(true, index)}>
                      <TimeText>{data.time}</TimeText> 
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
            var filteredArray = this.state.solves.sort((a, b) => parseFloat(a.timeInSeconds) - parseFloat(b.timeInSeconds))
            
            this.setState({solves: filteredArray})
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
                this.setState({solves: filteredArray});
            }
        }
    }


    render(){
        const { navigate } = this.props.navigation;
        const { modalVisible } = this.state;
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
                    <TouchableOpacity activeOpacity={1} style={{width: 375, height: 250}}>
                    <View style={styles.centeredView}>
                        <ModalView>
                        <ModalScrambleText>{this.state.modalTime}</ModalScrambleText>
                        <ModalText>{this.state.modalCubeType}</ModalText>
                        <ModalText>{this.state.modalScramble}</ModalText>
                        <ModalText>{this.state.modalDate}</ModalText>
                            <ButtonClose
                            onPress={() => this.deleteSolve(this.state.currentSolveIndex)}
                        >
                            <TextStyle>Delete</TextStyle>
                        </ButtonClose>
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
                                <SolvesCount>{this.state.solvesCount} Solves</SolvesCount>
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
    width: 250px;
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