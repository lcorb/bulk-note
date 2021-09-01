import subprocess
import tkinter as tk
import tkinter.scrolledtext as sb
from tkinter import Widget, ttk
fields = (
    {
        'label' : 'Staff first name',
        'protected': False,
        'large': False,
        'special': ''
    },
    {
        'label' : 'Staff last name',
        'protected': False,
        'large': False,
        'special': ''
    },
    {
        'label' : 'Your MIS ID',
        'protected': False,
        'large': False,
        'special': ''
    },
    {
        'label' : 'Your password',
        'protected': True,
        'large': False,
        'special': ''
    },
    {
        'label' : 'Your OneSchool PIN',
        'protected': True,
        'large': False,
        'special': ''
    },
    {
        'label' : 'Date of contact (dd-mm)',
        'protected': False,
        'large': False,
        'special': ''
    },
    {
        'label' : 'Parent unaware',
        'protected': False,
        'large': False,
        'special': 'checkbox'
    },
    # {
    #     'label' : 'If neither parent nor student were contacted\nWhat should be included in the \'Other\' field',
    #     'protected': False,
    #     'large': False,
    #     'special': ''
    # },
    {
        'label' : 'Paste a list of EQIDs\n(or compass email footer)\n\nHint: include multiple copies of a\nstudent\'s EQID to select their parents',
        'protected': False,
        'large': True,
        'special': ''
    },
    {
        'label' : 'Enter the contact note details',
        'protected': False,
        'large': True,
        'special': ''
    }
)

def horizonal_rule(frame):
    sep = ttk.Separator(frame, orient='horizontal')
    sep.pack(fill=tk.X)

def make_header(window, header):
    top = ttk.Frame(window)
    header = ttk.Label(top, text=header, anchor='n', style='Header.TLabel', font=("-size", 18, "-weight", "bold"))
    top.pack(side = tk.TOP, fill = tk.X, padx = 5 , pady = 25)
    header.pack(side = tk.TOP, fill = tk.X)
    horizonal_rule(top)

def make_form(window, fields):
    entries = []
    first = True
    for field in fields:
        row = ttk.Frame(window)
        lab = ttk.Label(row, width=40, text=field['label'] + ': ', anchor='w', font=('calibri', 12))
        if field['special'] == 'checkbox':
            checkValue = tk.IntVar()
            ent = ttk.Checkbutton(row, variable=checkValue)
            entries.append((ent, lambda ent: checkValue.get()))
        # elif field['special'] == 'dropdown':
        #     dropdownValue = tk.StringVar()
        #     ent = ttk.Combobox(row, textvariable=dropdownValue)
        elif field['large']:
            ent = sb.ScrolledText(row, height=10, fg='white', bg='gray24', width=32, insertbackground='white', relief=tk.GROOVE, font=('helvetica', 12))
            entries.append((ent, lambda ent: ent.get('1.0', tk.END)))
            row['style'] = 'Card'
        else:
            ent = tk.Entry(row, show='*' if field['protected'] else '', width=32, foreground='white', background='#3D3D3D', font=('helvetica', 12), insertbackground='white', insertwidth=1)
            entries.append((ent, lambda ent: ent.get()))
            if first:
                first = False
                ent.focus_set()
        row.pack(side = tk.TOP, fill = tk.X, padx = 5 , pady = 5)
        lab.pack(side = tk.LEFT)
        ent.pack(side = tk.RIGHT, expand = True, fill = tk.X)
    return entries

def create_notes(button, entries):
    cmd = ['./dist/bulk-note.exe']
    for entry in entries:
        cmd.append(f'{entry[1](entry[0])}')

    subprocess.run(cmd)


if __name__ == '__main__':
    window = tk.Tk()
    window.tk.call('source', './theme/forest/forest-dark.tcl')
    window.option_add('*tearOff', False)
    ttk.Style().theme_use('forest-dark')
    # ttk.Style().configure('Header.TLabel', foreground='white', font=("-size", 42, "-weight", "bold"))
    # ttk.Style().configure('TLabel', font=('calibri', 12))
    # # ttk.Style().configure('TEntry', foreground='white', background='#3D3D3D', font=('helvetica', 11))
    # ttk.Style().configure('TFrame', background='slate gray')
    # ttk.Style().configure('TButton', padding=6, relief='raised', font=('helvetica', 11))
    # ttk.Style().configure('Wait.TButton', padding=6, relief='groove', font=('helvetica', 11), background='#292D3E')
    # ttk.Style().configure('TCheckbutton', font=('helvetica', 11), background='slate gray')

    window.resizable(0,0)
    # window.config(background='slate gray')
    window.title('Create Bulk Contact Notes')
    make_header(window, 'Fill out the form below:')
    entries = make_form(window, fields)
    # bg = tk.Frame(master=window, width=200, height=100, bg='gray')
    # bg.pack(fill=tk.BOTH, side=tk.LEFT, expand=True)
    # window.bind('<Return>', (lambda: create_notes(entries)))
    b1 = ttk.Button(window, text = 'Create Contact Notes!', style='Accent.TButton', command = (lambda: create_notes(b1, entries)))
    b1.pack(side = tk.BOTTOM, padx = 5, pady = 15)
    window.mainloop()