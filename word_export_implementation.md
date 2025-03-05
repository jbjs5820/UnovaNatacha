# Word Export Implementation Plan

## Overview

This document outlines the implementation plan for adding Microsoft Word (.docx) export functionality to the Academic Project Management Application. This feature will allow users to export their projects, tasks, and resources to a well-formatted Word document.

## Current State

Currently, the application supports:
- JSON export (for data backup)
- PDF export (for printing and sharing)

However, Word export is not yet implemented, which would be valuable for users who need to:
- Further edit the exported content
- Share documents in a widely compatible format
- Include the content in other academic documents

## Implementation Goals

1. Create a Word export utility that generates .docx files
2. Support exporting projects with their associated tasks and resources
3. Ensure proper formatting with academic styling
4. Include AI-generated content in the exports
5. Make the export process user-friendly and configurable

## Implementation Details

### 1. Library Selection

We'll use the [docx](https://github.com/dolanmiu/docx) JavaScript library for generating Word documents. This library provides a clean API for creating Word documents directly in the browser.

```javascript
// Install via npm if using a build system
// npm install docx
// For our browser-based app, we'll include it via CDN
```

### 2. Word Export Service

Create a new service for handling Word exports:

```javascript
// js/utils/wordExportService.js
const WordExportService = {
  /**
   * Generate a Word document from the provided data
   * @param {Object} data - The data to export (projects, tasks, resources)
   * @param {Object} options - Export options
   * @returns {Blob} - The generated Word document as a Blob
   */
  async generateWordDocument(data, options = {}) {
    // Import the docx library (if using CDN)
    const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, AlignmentType, UnderlineType, WidthType } = window.docx;
    
    // Create a new document
    const doc = new Document({
      creator: "Academic Project Manager",
      title: options.title || "Academic Project Export",
      description: "Exported from Academic Project Manager",
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 24, // 12pt
              font: "Calibri",
            },
            paragraph: {
              spacing: {
                line: 276, // 1.15 line spacing
                before: 0,
                after: 240, // 12pt after paragraph
              },
            },
          },
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 32, // 16pt
              bold: true,
              font: "Calibri",
              color: "2E74B5",
            },
            paragraph: {
              spacing: {
                before: 240, // 12pt before
                after: 120, // 6pt after
              },
            },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 28, // 14pt
              bold: true,
              font: "Calibri",
              color: "2E74B5",
            },
            paragraph: {
              spacing: {
                before: 240, // 12pt before
                after: 120, // 6pt after
              },
            },
          },
          {
            id: "Heading3",
            name: "Heading 3",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 26, // 13pt
              bold: true,
              font: "Calibri",
              color: "2E74B5",
            },
            paragraph: {
              spacing: {
                before: 240, // 12pt before
                after: 120, // 6pt after
              },
            },
          },
        ],
      },
    });
    
    const sections = [];
    
    // Add title page
    sections.push({
      properties: {},
      children: [
        new Paragraph({
          text: options.title || "Academic Project Export",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 240,
            after: 240,
          },
        }),
        new Paragraph({
          text: `Generated on ${new Date().toLocaleDateString()}`,
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 240,
            after: 480,
          },
        }),
      ],
    });
    
    // Add projects
    if (data.projects && data.projects.length > 0) {
      sections.push({
        properties: {},
        children: [
          new Paragraph({
            text: "Projects",
            heading: HeadingLevel.HEADING_1,
          }),
        ],
      });
      
      for (const project of data.projects) {
        // Add project details
        sections[sections.length - 1].children.push(
          new Paragraph({
            text: project.title,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: `Objective: ${project.objective || "N/A"}`,
          }),
          new Paragraph({
            text: `Description: ${project.description || "N/A"}`,
          }),
          new Paragraph({
            text: `Status: ${project.status || "Em Progresso"}`,
          }),
          new Paragraph({
            text: `Deadline: ${project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}`,
          })
        );
        
        // Add project tasks
        if (data.tasks && data.tasks.length > 0) {
          const projectTasks = data.tasks.filter(task => task.projectId === project.id);
          
          if (projectTasks.length > 0) {
            sections[sections.length - 1].children.push(
              new Paragraph({
                text: "Tasks",
                heading: HeadingLevel.HEADING_3,
              })
            );
            
            // Create tasks table
            const taskTable = new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              borders: {
                top: {
                  style: BorderStyle.SINGLE,
                  size: 1,
                  color: "auto",
                },
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 1,
                  color: "auto",
                },
                left: {
                  style: BorderStyle.SINGLE,
                  size: 1,
                  color: "auto",
                },
                right: {
                  style: BorderStyle.SINGLE,
                  size: 1,
                  color: "auto",
                },
                insideHorizontal: {
                  style: BorderStyle.SINGLE,
                  size: 1,
                  color: "auto",
                },
                insideVertical: {
                  style: BorderStyle.SINGLE,
                  size: 1,
                  color: "auto",
                },
              },
              rows: [
                // Header row
                new TableRow({
                  tableHeader: true,
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: "Title", bold: true })],
                      shading: {
                        fill: "F2F2F2",
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "Status", bold: true })],
                      shading: {
                        fill: "F2F2F2",
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "Priority", bold: true })],
                      shading: {
                        fill: "F2F2F2",
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "Due Date", bold: true })],
                      shading: {
                        fill: "F2F2F2",
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: "Progress", bold: true })],
                      shading: {
                        fill: "F2F2F2",
                      },
                    }),
                  ],
                }),
                // Task rows
                ...projectTasks.map(task => new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: task.title })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: task.status || "Não Iniciada" })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: task.priority || "Média" })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A" })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: `${task.progress || 0}%` })],
                    }),
                  ],
                })),
              ],
            });
            
            sections[sections.length - 1].children.push(taskTable);
            
            // Add task details
            for (const task of projectTasks) {
              sections[sections.length - 1].children.push(
                new Paragraph({
                  text: `Task: ${task.title}`,
                  heading: HeadingLevel.HEADING_4,
                  pageBreakBefore: true,
                }),
                new Paragraph({
                  text: `Description: ${task.description || "N/A"}`,
                }),
                new Paragraph({
                  text: `Status: ${task.status || "Não Iniciada"}`,
                }),
                new Paragraph({
                  text: `Priority: ${task.priority || "Média"}`,
                }),
                new Paragraph({
                  text: `Category: ${task.category || "Investigação"}`,
                }),
                new Paragraph({
                  text: `Progress: ${task.progress || 0}%`,
                }),
                new Paragraph({
                  text: `Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}`,
                }),
                new Paragraph({
                  text: `Assigned To: ${task.assignedTo || "N/A"}`,
                })
              );
              
              // Add AI content if available
              if (task.aiContent) {
                sections[sections.length - 1].children.push(
                  new Paragraph({
                    text: "AI-Generated Content:",
                    bold: true,
                  }),
                  new Paragraph({
                    text: task.aiContent,
                  })
                );
              }
              
              // Add comments if available
              if (task.comments && task.comments.length > 0) {
                sections[sections.length - 1].children.push(
                  new Paragraph({
                    text: "Comments:",
                    bold: true,
                  })
                );
                
                for (const comment of task.comments) {
                  sections[sections.length - 1].children.push(
                    new Paragraph({
                      text: `${comment.date}: ${comment.text}`,
                    })
                  );
                }
              }
            }
          }
        }
        
        // Add project resources
        if (data.resources && data.resources.length > 0) {
          const projectResources = data.resources.filter(resource => resource.projectId === project.id);
          
          if (projectResources.length > 0) {
            sections[sections.length - 1].children.push(
              new Paragraph({
                text: "Resources",
                heading: HeadingLevel.HEADING_3,
                pageBreakBefore: true,
              })
            );
            
            for (const resource of projectResources) {
              sections[sections.length - 1].children.push(
                new Paragraph({
                  text: resource.title,
                  bold: true,
                }),
                new Paragraph({
                  text: `Type: ${resource.type || "article"}`,
                }),
                new Paragraph({
                  text: `Authors: ${resource.authors || "N/A"}`,
                }),
                new Paragraph({
                  text: `Description: ${resource.description || "N/A"}`,
                }),
                new Paragraph({
                  text: `URL: ${resource.url || "N/A"}`,
                  hyperlink: resource.url ? {
                    url: resource.url,
                  } : undefined,
                })
              );
              
              // Add citation if available
              if (resource.citation) {
                sections[sections.length - 1].children.push(
                  new Paragraph({
                    text: "Citation:",
                    bold: true,
                  }),
                  new Paragraph({
                    text: resource.citation,
                  })
                );
              }
              
              // Add notes if available
              if (resource.notes) {
                sections[sections.length - 1].children.push(
                  new Paragraph({
                    text: "Notes:",
                    bold: true,
                  }),
                  new Paragraph({
                    text: resource.notes,
                  })
                );
              }
              
              // Add separator between resources
              if (projectResources.indexOf(resource) < projectResources.length - 1) {
                sections[sections.length - 1].children.push(
                  new Paragraph({
                    text: "",
                    border: {
                      bottom: {
                        color: "auto",
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 6,
                      },
                    },
                  })
                );
              }
            }
          }
        }
      }
    }
    
    // Add all sections to the document
    for (const section of sections) {
      doc.addSection(section);
    }
    
    // Generate and return the document as a Blob
    return await Packer.toBlob(doc);
  },
  
  /**
   * Export data to a Word document and trigger download
   * @param {Object} data - The data to export
   * @param {Object} options - Export options
   */
  async exportToWord(data, options = {}) {
    try {
      const blob = await this.generateWordDocument(data, options);
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = options.filename || "academic-project-export.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error("Error exporting to Word:", error);
      return { error };
    }
  }
};

window.WordExportService = WordExportService;
```

### 3. Update Export View Component

Modify the existing `ExportView.js` component to include Word export functionality:

```javascript
// Add Word export option to the export view
const exportFormatSelect = document.getElementById('export-format');
if (exportFormatSelect) {
  // Check if the Word option already exists
  if (!Array.from(exportFormatSelect.options).some(option => option.value === 'word')) {
    const wordOption = document.createElement('option');
    wordOption.value = 'word';
    wordOption.textContent = 'Microsoft Word (.docx)';
    exportFormatSelect.appendChild(wordOption);
  }
}

// Update the export function to handle Word format
async function exportData() {
  const format = document.getElementById('export-format').value;
  const includeProjects = document.getElementById('include-projects').checked;
  const includeTasks = document.getElementById('include-tasks').checked;
  const includeResources = document.getElementById('include-resources').checked;
  
  // Gather data to export
  const data = {};
  
  if (includeProjects) {
    data.projects = window.ProjectsView.getProjects();
  }
  
  if (includeTasks) {
    data.tasks = window.TasksView.getTasks();
  }
  
  if (includeResources) {
    data.resources = window.ResourcesView.getResources();
  }
  
  // Export based on selected format
  if (format === 'json') {
    // Existing JSON export code...
  } else if (format === 'pdf') {
    // Existing PDF export code...
  } else if (format === 'word') {
    // New Word export code
    const title = document.getElementById('export-title').value || 'Academic Project Export';
    const options = {
      title: title,
      filename: `${title.toLowerCase().replace(/\s+/g, '-')}.docx`
    };
    
    try {
      const result = await window.WordExportService.exportToWord(data, options);
      
      if (result.error) {
        showNotification('Error exporting to Word: ' + result.error.message, 'error');
      } else {
        showNotification('Successfully exported to Word', 'success');
      }
    } catch (error) {
      console.error('Error during Word export:', error);
      showNotification('Error exporting to Word', 'error');
    }
  }
}
```

### 4. Add docx Library to the Application

Add the docx library to the application by including it in the HTML:

```html
<!-- Add to index.html before your application scripts -->
<script src="https://unpkg.com/docx@7.8.2/build/index.js"></script>
```

## Implementation Steps

1. **Add Library Dependencies**:
   - Include the docx library in the application

2. **Create Word Export Service**:
   - Implement the WordExportService with document generation functionality
   - Add support for formatting and styling

3. **Update Export View**:
   - Add Word export option to the export format dropdown
   - Implement the export handler for Word documents

4. **Testing**:
   - Test the export functionality with various data combinations
   - Verify the formatting and structure of the generated documents
   - Test with AI-generated content and resources

## Timeline

1. **Day 1**: Add library dependencies and create basic Word export service
2. **Day 2**: Implement document generation with proper formatting
3. **Day 3**: Update the Export View component and integrate with the service
4. **Day 4**: Testing and refinement

## Conclusion

Adding Word export functionality will significantly enhance the application's utility for academic users. The implementation leverages the docx library to generate well-formatted documents that include all relevant project data, tasks, and resources. This feature will allow users to easily share their academic project information in a widely compatible format and further edit the content as needed.
