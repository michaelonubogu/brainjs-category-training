import * as brainjs from 'brain.js';
import * as fs from 'fs';
import * as oboe from 'oboe';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { TrainingData, CategoryTrainingData } from './training-data.model';
import { UtilService } from './util.service';
import { StatusMessage } from './status-message.model';
import { ITrainStreamOptionsLocal } from './training-data.model';

const appRoot = require('app-root-path');
const appConfig = require(`${appRoot}/app-config.json`);

@Injectable()
export class TrainNeuralNetJobService implements OnApplicationBootstrap {

    private brain;

    public onApplicationBootstrap() {
        // this.trainCategoryNeuralNet();
        this.trainsCategoryNeuralNet2();
    }

    public async trainCategoryNeuralNet(): Promise<StatusMessage> {
        return new Promise(async (resolve, reject) => {
            try {
                const categoryNeuralNet = new brainjs.recurrent.LSTM();
                let iterations: number = 1;

                const trainStreamOptions: ITrainStreamOptionsLocal = {
                    hiddenLayers: [50, 25, 10],
                    neuralNetwork: categoryNeuralNet,
                    neuralNetworkGPU: categoryNeuralNet,
                    log: true,
                    floodCallback: () => {
                        iterations += 1;
                        // console.log(` >> flood called - iteration = ${iterations}`);
                        this.readCategoryInputDataForTraining(trainStream);
                    },
                    doneTrainingCallback: async (state) => {
                        console.log('==     finished training category neural net');
                        console.log(state);

                        // export our neural net for saving
                        const neuralNetJSONExport = categoryNeuralNet.toJSON();
                        await this
                            .saveNeuralNetToFile(JSON.stringify(neuralNetJSONExport), `${appRoot}/data/neural-network-category.json`);

                        resolve({ status: 'Complete', message: 'Training Category Neural Net!' });
                    },
                };

                // kick off training
                const trainStream = new brainjs.TrainStream(trainStreamOptions);
                console.log(` >> 1st iteration called - iteration = ${iterations}`);
                this.readCategoryInputDataForTraining(trainStream);

            } catch (err) {
                reject({
                    status: 'Failed',
                    message: 'An error occured while Training Category Neural Net',
                });
            }
        });
    }

    public async trainsCategoryNeuralNet2(): Promise<StatusMessage> {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await this.readCategoryInputData();
                const options: brainjs.IRNNDefaultOptions = {};
                const categoryNeuralNet = new brainjs.recurrent.LSTM();
                categoryNeuralNet.train(data, {
                    log: true
                });
                const neuralNetJSONExport = categoryNeuralNet.toJSON();
                await this
                    .saveNeuralNetToFile(JSON.stringify(neuralNetJSONExport), `${appRoot}/data/neural-network-category.json`);
                resolve({ status: 'Complete', message: 'Done training' });
            } catch (err) {
                resolve({ status: 'Failed', message: 'Done training' });
            }
        });
    }

    private prepInputData(data: CategoryTrainingData): TrainingData[] {

        const returnData: TrainingData[] = [];
        const categoryScrub = data.category.replace(' ', '_');

        // output[categoryScrub] = 1;

        // let titleArr: number[] = UtilService.tokenizeString(data.title);
        // let textArr: number[] = UtilService.tokenizeString(data.text);

        // make sure we don't exceed the length of our array length limit when encoded
        /*titleArr = titleArr.length > appConfig.brainjs.maxLengthInput
            ? titleArr.slice(0, appConfig.brainjs.maxLengthInput)
            : UtilService.setInputLengthToLimit(titleArr, appConfig.brainjs.maxLengthInput);

        textArr = textArr.length > appConfig.brainjs.maxLengthInput
            ? textArr.slice(0, appConfig.brainjs.maxLengthInput)
            : UtilService.setInputLengthToLimit(textArr, appConfig.brainjs.maxLengthInput);*/

        // 2 entries into our data -> (1) for title (2) for text
        // NOTE: just title (for now) - until we I can get this to work
        returnData.push({
            input: data.title,
            output: categoryScrub,
        });

        return returnData;
    }

    private readCategoryInputData() {
        return new Promise((resolve, reject) => {
            const trainingData: any[] = [];
            const readStream = fs
                .createReadStream(`${appRoot}/data/category-training-data.json`);

            oboe(readStream)
                .node('!.*', ((data) => {
                    const parsedData = JSON.parse(data);
                    const inputData: TrainingData[] = this.prepInputData(parsedData);
                    inputData.forEach(d => {
                        trainingData.push(d);
                    });
                    return oboe.drop;
                }).bind(this))
                .fail((result) => {
                    reject(result);
                })
                .done((empty: any) => {
                    resolve(trainingData);
                });
        });
    }

    private readCategoryInputDataForTraining(trainStream: brainjs.TrainStream) {
        const readStream = fs
            .createReadStream(`${appRoot}/data/category-training-data.json`);

        oboe(readStream)
            .node('!.*', ((data) => {
                const parsedData = JSON.parse(data);
                const inputData: TrainingData[] = this.prepInputData(parsedData);
                inputData.forEach(d => {
                    trainStream.write(d);
                    // console.log(`--     added data to category training net for => ${parsedData.category} | ${parsedData.title}`);
                });
                return oboe.drop;
            }).bind(this))
            .done((empty: any) => {
                trainStream.endInputs();
                // console.log('==     finished streaming JSON from file');
            });
    }
    private async saveNeuralNetToFile(neuralNetJSON: string, filePath: string) {
        const path = filePath;

        fs.writeFileSync(
            path,
            neuralNetJSON);
    }
}
