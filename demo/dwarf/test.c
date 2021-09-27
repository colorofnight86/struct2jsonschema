#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct aa
{
    int aa;
    char *str;
};

struct AA
{
    int a;
    float f;
    int AA[10];

    struct aa A;
};

int main(int argc, char** argv)
{
    struct AA a;

    memset(&a, 0, sizeof(a));

    a.a = 10;
    a.f = 1.0;
    a.A.aa = 100;
    a.A.str = NULL;

    printf("hello world!\n");
    {
        FILE *fp;

        fp = fopen("test.bin", "wb");
        if (fp)
        {
            fwrite(&a, sizeof(a), 1, fp);
            fclose(fp);
        }
    }

    return 0;
}
