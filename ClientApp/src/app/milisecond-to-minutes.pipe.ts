import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'millisecondsToMinutes'
})
export class MillisecondsToMinutesPipe implements PipeTransform {
	transform(milliseconds: number): number {
		//Trick to keep round to decimal places
		return Math.round(milliseconds / 1000 / 60 * 100) / 100;
	}
}
