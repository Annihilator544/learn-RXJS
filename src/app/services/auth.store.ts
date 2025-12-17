import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { User } from "../model/user";
import { map, shareReplay, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";

const AUTH_DATA = "auth_data"

@Injectable({
    providedIn: "root",
})
export class AuthStore {
    private subject = new BehaviorSubject<User | null>(null);
    user$: Observable<User | null> = this.subject.asObservable();
    isLoggedIn$: Observable<boolean>;
    isLoggedOut$: Observable<boolean>;

    constructor(private http: HttpClient){
        this.isLoggedIn$ = this.user$.pipe(map(user => !!user));
        this.isLoggedOut$ = this.isLoggedIn$.pipe(map(loggedIn => !loggedIn));
        const authData = localStorage.getItem(AUTH_DATA);
        if (authData) {
            this.subject.next(JSON.parse(authData));
        }
    }

    login(username: string, password: string): Observable<User> {
        return this.http.post<User>('/api/login', { username, password })
        .pipe(
            tap(user => {
                this.subject.next(user)
                localStorage.setItem(AUTH_DATA, JSON.stringify(user));
            }),
            shareReplay()
        );
    }

    logout(): void {
        this.subject.next(null);
        localStorage.removeItem(AUTH_DATA);
    }
}