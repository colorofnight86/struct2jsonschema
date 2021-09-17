/*
 * Copyright (c) 2006-2018, RT-Thread Development Team
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Change Logs:
 * Date           Author       Notes
 * 2018-11-06     SummerGift   first version
 */

#include <rtthread.h>
#include <stdio.h>

#define LED_ON     1
#define LED_OFF    0


/* apple struct*/
struct apple
{
    int num;
    char*  color;
    float weight;
    char class;
    short status;
    char origin[20];
};

// assignment
// const struct apple apple3 = {10,"red",0.8,'A',1,"China"};

//JSON
// {
//     "num":10,
//     "color":"red",
//     "weight":"0.8",
//     "class":"A",
//     "status":1,
//     "origin":"China"
// }

/*led struct*/
struct led
{
    char    name[8];
    int     status;
};




int main(void)
{
    const struct led led1 = {"red",  LED_ON};
    const struct led led2 = {"blue", LED_OFF};
    const struct apple apple1 = {10,"red",0.8,'A',1,"China"};
    const struct apple apple2 = {10,"blue",1.35,'C',0,"American"};

    rt_kprintf("led1 name:%s\n",    led1.name);
    rt_kprintf("led2 status:%d\n",  led2.status);
    rt_kprintf("apple1 color:%s\n", apple1.color);
    rt_kprintf("apple2 color:%s\n", apple2.color);

    return 0;
}
