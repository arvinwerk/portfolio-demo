import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Store} from "@ngrx/store";
import {AppState} from "../../../services/app-state";
import {projectKeywords} from "../../reducer/project-store.reducer";
import {Observable} from "rxjs";
import {KeywordOptionModel} from "../../models/keyword-option.model";

@Component({
  selector: 'app-project-filter',
  templateUrl: './project-filter.component.html',
  styleUrls: ['./project-filter.component.scss']
})
export class ProjectFilterComponent implements OnInit {
  @Input('keywordOptions') keywordOptions: KeywordOptionModel[] = [];
  @Output('keywordClicked') keywordClicked: EventEmitter<KeywordOptionModel> = new EventEmitter<KeywordOptionModel>();

  constructor() {
  }

  ngOnInit(): void {
  }

  toggleKeyword(keyword: KeywordOptionModel) {
    this.keywordClicked.emit(keyword);
  }
}
