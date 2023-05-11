import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProjectModel} from "../../models/project.model";
import {KeywordOptionModel} from "../../models/keyword-option.model";

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  @Input('keywordOptions') keywordOptions: KeywordOptionModel[] = [];
  @Output('keywordClicked') keywordClicked: EventEmitter<KeywordOptionModel> = new EventEmitter<KeywordOptionModel>();

  @Input() projects: ProjectModel[] = [];

  constructor() {
  }

  ngOnInit(): void {
  }


  toggleKeyword(keyword: string) {
    const keywordOption = this.keywordOptions.find((keywordOption) => keywordOption.key === keyword);
    this.keywordClicked.emit(keywordOption);
  }

  isSelected(keyword: string): boolean {
    return this.keywordOptions.some((keywordOption) => keywordOption.key === keyword && keywordOption.selected);
  }

  getImageUrl(image: string) {
    return `assets/images/logos/${image}`;
  }
}
