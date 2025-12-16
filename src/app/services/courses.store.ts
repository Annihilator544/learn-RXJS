import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { Course, sortCoursesBySeqNo } from "../model/course";
import { catchError, filter, map, shareReplay, tap } from "rxjs/operators";
import { LoadingService } from "../loading/loading.service";
import { HttpClient } from "@angular/common/http";
import { MessagesService } from "../messages/messages.service";

@Injectable({
    providedIn: 'root'
})

export class CoursesStore {

    private subject = new BehaviorSubject<Course[]>([]);

    courses$: Observable<Course[]> = this.subject.asObservable();

    constructor(
        private http: HttpClient,
        private loading: LoadingService,
        private messages: MessagesService
    ) { 
        this.loadAllCourses()
    }

    private loadAllCourses(){
        const loadCourses$ = this.http.get<Course[]>('/api/courses')
        .pipe(
            map(res => res["payload"]),
            catchError(err => {
                this.messages.showError("Could not load courses");
                console.log("Error loading courses", err);
                return throwError(err);
            }),
            tap(courses => this.subject.next(courses))
        );
        this.loading.showLoaderUntilCompleted(loadCourses$)
        .subscribe();
    }

    saveCourse(courseId: string, changes: Partial<Course>): Observable<any> {

        const courses = this.subject.getValue();

        const index = courses.findIndex(course => course.id === courseId);

        const newCourse = {
            ...courses[index],
            ...changes
        };

        const newCourses = courses.slice(0);
        newCourses[index] = newCourse;

        this.subject.next(newCourses);

        return this.http.put(`/api/courses/${courseId}`, changes)
            .pipe(
                catchError(err => {
                    this.messages.showError("Could not save course");
                    console.log("Error saving course", err);
                    return throwError(err);
                }),
                shareReplay()
            );
    }

    filterByCategory(category: string): Observable<Course[]> {
        return this.courses$.pipe(
            map(courses =>
                courses.filter(course => course.category === category).sort(sortCoursesBySeqNo)
            )
        );
    }
}