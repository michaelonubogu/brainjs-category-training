import { Module } from '@nestjs/common';
import { TrainNeuralNetJobService } from './train-neural-net.job';

@Module({
    providers: [
        TrainNeuralNetJobService
    ],
})
export class UtilModule { }
