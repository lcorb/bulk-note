import subprocess
import tkinter as tk
import tkinter.scrolledtext as sb
from tkinter import ttk
fields = (
    {
        'label' : 'Staff first name',
        'protected': False,
        'large': False
    },
    {
        'label' : 'Staff last name',
        'protected': False,
        'large': False
    },
    {
        'label' : 'Your MIS ID',
        'protected': False,
        'large': False
    },
    {
        'label' : 'Your password',
        'protected': True,
        'large': False
    },
    {
        'label' : 'Your OneSchool PIN',
        'protected': True,
        'large': False
    },
    {
        'label' : 'Date of contact (dd-mm)',
        'protected': False,
        'large': False
    },
    {
        'label' : 'Paste a list of EQIDs\n(or the footer from a compass email)',
        'protected': False,
        'large': True
    },
    {
        'label' : 'Enter the contact note details',
        'protected': False,
        'large': True
    }
)

def horizonal_rule(frame):
    sep = ttk.Separator(frame, orient='horizontal')
    sep.pack(fill=tk.X)

def make_header(window, header):
    top = ttk.Frame(window)
    header = ttk.Label(top, text=header, anchor='n', style='Header.TLabel')
    top.pack(side = tk.TOP, fill = tk.X, padx = 5 , pady = 25)
    header.pack(side = tk.TOP, fill = tk.X)
    horizonal_rule(top)

def make_form(window, fields):
    entries = []
    first = True
    for field in fields:
        row = ttk.Frame(window)
        lab = ttk.Label(row, width=32, text=field['label'] + ': ', anchor='w')
        if field['large']:
            ent = sb.ScrolledText(row, height=10, fg='white', bg='gray24', width=32, insertbackground='white', relief=tk.GROOVE, font=('helvetica', 11))
            entries.append((ent, lambda ent: ent.get('1.0', tk.END)))
        else:
            ent = tk.Entry(row, show='*' if field['protected'] else '', width=32, foreground='white', background='#3D3D3D', font=('helvetica', 11), insertbackground='white', insertwidth=1)
            entries.append((ent, lambda ent: ent.get()))
            if first:
                first = False
                ent.focus_set()
        row.pack(side = tk.TOP, fill = tk.X, padx = 5 , pady = 5)
        lab.pack(side = tk.LEFT)
        ent.pack(side = tk.RIGHT, expand = True, fill = tk.X)
    return entries

def create_notes(entries):
    cmd = ['./dist/bulk-note.exe']
    for entry in entries:
        print()
        cmd.append(f'"{entry[1](entry[0])}"')

    subprocess.run(cmd)

if __name__ == '__main__':
    window = tk.Tk()
    ttk.Style().configure('Header.TLabel', foreground='white', background='slate gray', font=(42))
    ttk.Style().configure('TLabel', foreground='white', background='slate gray', font=('helvetica', 11))
    # ttk.Style().configure('TEntry', foreground='white', background='#3D3D3D', font=('helvetica', 11))
    ttk.Style().configure('TFrame', background='slate gray')
    ttk.Style().configure('TButton', padding=6, relief='raised', font=('helvetica', 11))

    window.resizable(0,0)
    window.config(background='slate gray')
    window.title('Create Bulk Contact Notes')
    make_header(window, 'Fill out the form below:')
    entries = make_form(window, fields)
    # bg = tk.Frame(master=window, width=200, height=100, bg='gray')
    # bg.pack(fill=tk.BOTH, side=tk.LEFT, expand=True)
    # window.bind('<Return>', (lambda: create_notes(entries)))
    b1 = ttk.Button(window, text = 'Create Contact Notes!', command = (lambda: create_notes(entries)))
    b1.pack(side = tk.BOTTOM, padx = 5, pady = 15)
    window.mainloop()