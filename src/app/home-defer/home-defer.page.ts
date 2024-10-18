import { Component, OnInit, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  InfiniteScrollCustomEvent,
  IonBadge,
  IonLabel,
  IonAvatar,
  IonItem,
  IonList,
  IonLoading,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSkeletonText,
  IonAlert,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { MovieService } from '../services/movie.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-defer',
  templateUrl: './home-defer.page.html',
  styleUrls: ['./home-defer.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonLabel,
    IonBadge,
    IonAvatar,
    IonItem,
    IonList,
    IonLoading,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSkeletonText,
    IonAlert,
    IonSearchbar,
    FormsModule,
    CommonModule, // Import FormsModule to use ngModel
    DatePipe,
    RouterModule,
  ],
})
export class HomeDeferPage implements OnInit {
  private movieService = inject(MovieService);
  private currentPage = 1;
  public movies: any[] = [];
  public filteredMovies: any[] = []; // Store filtered results
  public imageBaseUrl = 'https://image.tmdb.org/t/p';
  public isLoading = true;
  public error = null;
  public dummyArray = new Array(5);
  public searchTerm: string = ''; // Variable to hold search input
  public isFiltering: boolean = false; // Flag to check if filtering is active

  ngOnInit() {
    this.loadMovies();
  }

  // Method to filter movies based on the search term
  filterMovies(event: any) {
    const query = event.target.value?.toLowerCase(); // Get the search query

    // Check if the search term is not empty
    if (query && query.trim() !== '') {
      this.isFiltering = true; // Set filtering flag
      // Filter movies based on the query
      this.filteredMovies = this.movies.filter((movie) =>
        movie.title.toLowerCase().includes(query)
      );
    } else {
      this.isFiltering = false; // Reset filtering flag
      // Reset to all movies if the search is empty
      this.filteredMovies = [...this.movies];
    }
  }

  async loadMovies(event?: InfiniteScrollCustomEvent) {
    // If filtering is active, do not load more movies
    if (this.isFiltering) {
      return;
    }

    this.error = null; // Reset error state

    if (!event) {
      this.isLoading = true; // Show loading indicator
    }

    this.movieService
      .getTopRatedMovies(this.currentPage)
      .pipe(
        finalize(() => {
          this.isLoading = false; // Hide loading indicator
        }),
        catchError((err: any) => {
          this.error = err.error.status_message; // Capture any errors
          return [];
        })
      )
      .subscribe({
        next: (res) => {
          this.movies.push(...res.results); // Add new movies to the list
          this.filteredMovies = [...this.movies]; // Initialize filteredMovies with all movies
          event?.target.complete(); // Complete the infinite scroll

          // Disable the infinite scroll if we've reached the last page
          if (event) {
            event.target.disabled = res.total_pages === this.currentPage;
          }
        },
      });
  }

  loadMore(event: InfiniteScrollCustomEvent) {
    // Call loadMovies to load more movies
    this.currentPage++; // Increment the current page
    this.loadMovies(event); // Load more movies
  }
}
