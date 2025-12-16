import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { filter } from "rxjs/operators";

@Injectable()
export class MessagesService {

    private subject = new BehaviorSubject<string[]>([]);

    errors$: Observable<string[]> = this.subject.asObservable()
        .pipe(
            filter(errors => errors && errors.length > 0)
        );

    showError(...errors: string[]) {
        this.subject.next(errors);
        console.error("Errors:", errors);
    }
}