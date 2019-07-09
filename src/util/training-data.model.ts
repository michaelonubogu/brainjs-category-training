import * as brainjs from 'brain.js';

export interface ITrainStreamOptionsLocal extends brainjs.ITrainStreamOptions, brainjs.INeuralNetworkOptions, brainjs.INeuralNetworkTrainingOptions {
    localId?: string;
}

export interface VideoGameTrainingData {
    title: string;
    link: string;
    text: string;
    img?: string;
    date: Date;
}

export interface CategoryTrainingData extends VideoGameTrainingData {
    category: string;
}

export interface TrainingData {
    input: string;
    output: string;
}
