import {Injectable} from '@angular/core';
import {differenceInYears} from 'date-fns';
import {combineLatest, filter, map, Observable, of} from "rxjs";
import {PersonalModel} from "../models/personal.model";
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class PersonalService {
    private currentDate$ = of(new Date());
    private personalCache$: Observable<PersonalModel> | null = null;

    constructor(private httpClient: HttpClient) {
    }

    personal(): Observable<PersonalModel> {
        // fake api call. Creating api out of the scope of this demo
        if (!this.personalCache$) {
            this.personalCache$ = this.httpClient.get<PersonalModel>('/assets/api/personal-info.json');
        }
        return this.personalCache$;
    }

    foreword(): Observable<PersonalModel> {
        return combineLatest([this.age$, this.yearsAsDeveloper$, this.personal()]).pipe(
            map(([age, yearsAsDeveloper, personal]) => {
                return {
                    ...personal,
                    foreword: personal.foreword.replace('${age}', age.toString()).replace('${yearsAsDeveloper}', yearsAsDeveloper.toString())
                }
            })
        )
    }

    private get age$(): Observable<number> {
        return combineLatest([this.personal(), this.currentDate$])
            .pipe(
                map(([personal, currentDate]) => differenceInYears(currentDate, new Date(personal.dateOfBirth)))
            );
    }

    private get yearsAsDeveloper$() {
        return combineLatest([this.personal(), this.currentDate$]).pipe(map(([personal, currentDate]) => differenceInYears(currentDate, new Date(personal.developingStartDate))));
    }
}
