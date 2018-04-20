import { Component } from '@angular/core';
import { CoursesService } from '../courses.service';
@Component({
    selector: 'students-list',
    templateUrl: 'app/courses/students-list/students-list.template.html',
    styleUrls: ['./assets/css/style.css']
})
export class StudentsListComponent {
    courses: any;
    errorMessage: string;
    constructor(private _coursesService: CoursesService) { }
    ngOnInit() {
        this._coursesService.studentsList().subscribe(courses => this.courses
            = courses);
    }
}

