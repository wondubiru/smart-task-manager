# 🚀 Smart Task Manager

[![Angular](https://img.shields.io/badge/Angular-19.1.6-red)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)](.)

> A powerful, intelligent task management application built with Angular 19 and TypeScript. Manage your tasks with style, get insights with analytics, and boost your productivity like never before! ⚡

## ✨ Features

### 🎯 Core Task Management
- **CRUD Operations**: Create, read, update, and delete tasks with ease
- **Advanced Filtering**: Filter by status, priority, category, and date
- **Smart Search**: Intelligent search across all task properties
- **Subtask Management**: Break down complex tasks into manageable subtasks
- **Time Tracking**: Estimate and track actual time spent on tasks
- **Status Management**: Track progress with multiple status states

### 📊 Productivity Analytics
- **Comprehensive Dashboard**: Real-time insights into your productivity
- **Performance Metrics**: Track completion rates, time efficiency, and consistency
- **Visual Charts**: Beautiful charts for weekly progress and category breakdown
- **Burnout Prevention**: AI-powered burnout risk assessment
- **Goal Tracking**: Monthly trends and productivity scoring

### 🔔 Smart Notifications
- **Browser Notifications**: Get notified about due and overdue tasks
- **Smart Scheduling**: Automatic reminders based on task priority
- **Milestone Celebrations**: Get rewarded for completing tasks and reaching goals

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Mode Support**: Automatic dark mode based on system preferences
- **Floating Action Menu**: Quick access to common actions
- **Keyboard Shortcuts**: Power-user shortcuts for maximum efficiency
- **Smooth Animations**: Delightful micro-interactions and transitions

### 💾 Data Management
- **Local Storage**: All data stored locally in your browser
- **Export/Import**: Backup and restore your tasks in JSON or CSV format
- **Task Templates**: Pre-defined templates for common tasks
- **Recurring Tasks**: Automate routine tasks with smart scheduling

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Modern web browser with ES2022 support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smart-task-manager.git
   cd smart-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🎮 Usage

### Creating Tasks
1. Click the **"Add Task"** button or press `Ctrl+N`
2. Fill in the task details:
   - **Title**: What needs to be done
   - **Description**: Additional context and details
   - **Due Date**: When the task should be completed
   - **Priority**: Low, Medium, High, or Urgent
   - **Category**: Work, Personal, Health, Learning, or Other
   - **Tags**: Organize with custom tags
   - **Time Estimation**: How long you think it will take
   - **Subtasks**: Break down complex tasks

### Managing Tasks
- **View Tasks**: Browse all tasks in the main list view
- **Edit Tasks**: Click the edit button or use `Ctrl+E`
- **Delete Tasks**: Remove completed or cancelled tasks
- **Search**: Use the search bar to find specific tasks
- **Filter**: Use dropdowns to filter by status, priority, or category
- **Sort**: Click column headers to sort by different criteria

### Analytics Dashboard
- Navigate to the Analytics tab to view:
  - Productivity score and trends
  - Task completion statistics
  - Time efficiency metrics
  - Category and priority breakdowns
  - Burnout risk assessment
  - Personalized productivity recommendations

### Keyboard Shortcuts
- `Ctrl+T`: Go to Tasks
- `Ctrl+N`: New Task
- `Ctrl+A`: Analytics Dashboard
- `Ctrl+S`: Save/Export Data
- `Ctrl+K`: Show Keyboard Help
- `Ctrl+F`: Focus Search
- `Esc`: Clear Search/Close Modals

## 🏗️ Architecture

### Technology Stack
- **Frontend Framework**: Angular 19
- **Language**: TypeScript 5.7
- **Styling**: CSS3 with CSS Variables
- **State Management**: RxJS with BehaviorSubjects
- **Data Persistence**: Browser Local Storage
- **Build Tool**: Angular CLI with Webpack

### Project Structure
```
src/
├── app/
│   ├── components/          # Angular components
│   │   ├── task-list/       # Main task list view
│   │   ├── task-form/       # Task creation/editing
│   │   ├── task-detail/     # Individual task view
│   │   └── analytics-dashboard/ # Analytics and insights
│   ├── services/            # Business logic services
│   │   ├── task.service.ts  # Task CRUD operations
│   │   ├── notification.service.ts # Smart notifications
│   │   ├── data-export.service.ts # Data import/export
│   │   ├── keyboard-shortcuts.service.ts # Keyboard shortcuts
│   │   └── task-templates.service.ts # Task templates
│   ├── models/              # TypeScript interfaces
│   │   └── task.model.ts    # Task and subtask models
│   └── app.routes.ts        # Routing configuration
├── styles.css               # Global styles
└── index.html              # Application entry point
```

### Key Services

#### TaskService
- Manages all task CRUD operations
- Implements reactive patterns with RxJS
- Handles search, filter, and sort functionality
- Manages subtask operations

#### NotificationService
- Browser notification management
- Smart scheduling for due tasks
- Productivity milestone celebrations

#### DataExportService
- Export tasks to JSON and CSV formats
- Import tasks from JSON files
- Data backup and restoration

#### KeyboardShortcutsService
- Global keyboard shortcut management
- Contextual help system
- Accessibility enhancements

## 🎨 Customization

### Themes
The application supports automatic dark mode based on system preferences. You can customize the color scheme by modifying CSS variables in `src/styles.css`:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  /* ... more variables */
}
```

### Adding New Task Categories
To add new task categories, update the category options in:
1. `src/app/models/task.model.ts` - Add to the Category type
2. `src/app/components/task-form/task-form.component.ts` - Add to categoryOptions
3. `src/app/services/task-templates.service.ts` - Update template validation

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow Angular style guide
- Write meaningful commit messages
- Add unit tests for new features
- Update documentation as needed
- Ensure responsive design principles

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Angular team for the amazing framework
- TypeScript team for the excellent language
- The open-source community for inspiration and tools

## 📞 Support

If you have any questions or need help:
- Create an issue on GitHub
- Check the documentation
- Review existing issues for solutions

## 🔮 Roadmap

### Upcoming Features
- [ ] Team collaboration and task sharing
- [ ] Voice input for creating tasks
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Mobile app (React Native)
- [ ] AI-powered task suggestions
- [ ] Time tracking with Pomodoro technique
- [ ] Integration with popular productivity tools
- [ ] Advanced reporting and insights
- [ ] Offline support with PWA features

---

**Made with ❤️ by Wondu Biru Tupasha**

*Built with Angular & TypeScript for maximum productivity and developer happiness!*

## 🌟 Star this repository if you found it helpful!