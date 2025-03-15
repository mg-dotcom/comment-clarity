import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommentsResponse } from '../../model/comment';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllComments(): Observable<CommentsResponse> {
    return this.http.get<CommentsResponse>(`${this.apiUrl}/comments`);
  }
}
